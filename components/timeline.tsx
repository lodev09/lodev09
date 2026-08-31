"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { scaleLinear, linkVertical } from "d3"
import profile from "@/data/profile.json"
import { MONTHS, formatPeriod, toFractionalYear } from "@/lib/period"
import { StarIcon } from "./icons"
import { TechIcon } from "./tech-icons"

export type TimelineProject = {
  name: string
  desc: string
  stars: number
  url: string
  languages: string[]
  createdAt: string
}

type Item = {
  id: string
  kind: "work" | "oss"
  title: string
  role?: string
  stars?: number
  period: string
  desc: string
  url?: string
  tech: string[]
  year: number
  endYear?: number
}

const MIN_WIDTH = 760
const PAD_X = 72
const EDGE_PAD = 24
const CARD_W = 176
const CARD_EXPANDED_W = 268
const CARD_H = 70
const CARD_GAP = 10
const AXIS_GAP = 32
const AXIS_GAP_BELOW = 52
const TOP_PAD = 28
const BOTTOM_PAD = 40
const CURRENT_YEAR_WEIGHT = 4
const GAP_WEIGHT = 0.5
const ZOOM_MAX = 32

const spring = { type: "spring", stiffness: 300, damping: 32 } as const

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

function buildItems(projects: TimelineProject[], now: number): Item[] {
  const work: Item[] = profile.experience.map((job) => ({
    id: `work-${job.company}`,
    kind: "work",
    title: job.company,
    role: job.role,
    period: formatPeriod(job.start, job.end),
    desc: job.desc,
    url: "url" in job ? job.url : undefined,
    tech: job.tech,
    year: toFractionalYear(job.start),
    endYear: job.end ? toFractionalYear(job.end) : now,
  }))

  const oss: Item[] = projects.map((project) => {
    const created = new Date(project.createdAt)
    return {
      id: `oss-${project.name}`,
      kind: "oss",
      title: project.name,
      stars: project.stars,
      period: `${MONTHS[created.getMonth()]} ${created.getFullYear()}`,
      desc: project.desc,
      url: project.url,
      tech: project.languages,
      year: created.getFullYear() + (created.getMonth() + 0.5) / 12,
    }
  })

  return [...work, ...oss].sort((a, b) => a.year - b.year)
}

function estimateExpandedHeight(item: Item) {
  const lines = Math.ceil(item.desc.length / 36)
  return (
    CARD_H + 8 + lines * 20 + (item.tech.length > 0 ? 28 : 0) + (item.url ? 26 : 0) + 10
  )
}

export function Timeline({ projects }: { projects: TimelineProject[] }) {
  const reduced = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pendingScroll = useRef<number | null>(null)
  const zoomRef = useRef(1)
  const minZoomRef = useRef(1)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [zoom, setZoom] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [panning, setPanning] = useState(false)
  const panState = useRef({ down: false, dragging: false, startX: 0, scrollStart: 0 })
  const [entered, setEntered] = useState(!!reduced)
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [measured, setMeasured] = useState<Record<string, number>>({})

  zoomRef.current = zoom

  const [now] = useState(() => {
    const date = new Date()
    return date.getFullYear() + (date.getMonth() + 0.5) / 12
  })
  const currentYear = Math.floor(now)

  const items = useMemo(() => buildItems(projects, now), [projects, now])

  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId(null)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  // Start scrolled to the current year on narrow screens
  useEffect(() => {
    const node = scrollRef.current
    if (node) node.scrollLeft = node.scrollWidth
  }, [size.width])

  // Pinch / ctrl+wheel zoom anchored at the cursor
  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      const scroll = scrollRef.current
      const current = zoomRef.current
      const next = clamp(current * Math.exp(event.deltaY * 0.01), minZoomRef.current, ZOOM_MAX)
      if (next === current) return
      if (scroll) {
        const viewportX = event.clientX - scroll.getBoundingClientRect().left
        pendingScroll.current = (scroll.scrollLeft + viewportX) * (next / current) - viewportX
      }
      setZoom(next)
    }
    node.addEventListener("wheel", onWheel, { passive: false })
    return () => node.removeEventListener("wheel", onWheel)
  }, [])

  useLayoutEffect(() => {
    if (pendingScroll.current !== null && scrollRef.current) {
      scrollRef.current.scrollLeft = pendingScroll.current
      pendingScroll.current = null
    }
  }, [zoom])

  // Replace the estimated expanded height with the real content height
  useLayoutEffect(() => {
    if (!selectedId) return
    const node = contentRefs.current[selectedId]
    if (!node) return
    const contentHeight = node.scrollHeight + 20
    setMeasured((prev) =>
      prev[selectedId] === contentHeight ? prev : { ...prev, [selectedId]: contentHeight }
    )
  }, [selectedId])

  // Drag to pan with the mouse when zoomed in; touch keeps native scrolling
  const onPanDown = (event: React.PointerEvent) => {
    const node = scrollRef.current
    if (event.pointerType !== "mouse" || event.button !== 0 || !node) return
    if (node.scrollWidth <= node.clientWidth) return
    panState.current = {
      down: true,
      dragging: false,
      startX: event.clientX,
      scrollStart: node.scrollLeft,
    }
  }

  const onPanMove = (event: React.PointerEvent) => {
    const state = panState.current
    const node = scrollRef.current
    if (!state.down || !node) return
    const dx = event.clientX - state.startX
    if (!state.dragging) {
      if (Math.abs(dx) < 5) return
      state.dragging = true
      setPanning(true)
      node.setPointerCapture(event.pointerId)
    }
    node.scrollLeft = state.scrollStart - dx
  }

  const onPanEnd = () => {
    panState.current.down = false
    setPanning(false)
    // dragging stays true so the trailing click is suppressed
  }

  const onPanClickCapture = (event: React.MouseEvent) => {
    if (panState.current.dragging) {
      event.preventDefault()
      event.stopPropagation()
      panState.current.dragging = false
    }
  }

  const zoomBy = (factor: number) => {
    const next = clamp(zoom * factor, minZoomRef.current, ZOOM_MAX)
    if (next === zoom) return
    const node = scrollRef.current
    if (node) {
      const center = node.clientWidth / 2
      pendingScroll.current = (node.scrollLeft + center) * (next / zoom) - center
    }
    setZoom(next)
  }

  const height = size.height
  // Center the axis within the usable card zone, not the full container
  const axisY = (TOP_PAD + height - BOTTOM_PAD) / 2
  const topZone = axisY - AXIS_GAP - TOP_PAD
  const bottomZone = height - BOTTOM_PAD - (axisY + AXIS_GAP_BELOW)
  const maxLanesTop = Math.max(1, Math.floor((topZone - CARD_H) / (CARD_H + 6)) + 1)
  const maxLanesBottom = Math.max(1, Math.floor((bottomZone - CARD_H) / (CARD_H + 6)) + 1)

  const { x, entryYears, placed, innerWidth, baseWidth, lanesTop, lanesBottom } = useMemo(() => {
    // Only years that contain an entry (start or end) get axis room; empty runs collapse to a gap
    const yearSet = new Set(items.map((item) => Math.floor(item.year)))
    for (const item of items) {
      if (item.endYear) yearSet.add(Math.min(Math.floor(item.endYear), currentYear))
    }
    yearSet.add(currentYear)
    const minYear = Math.min(...yearSet)
    const segments: { start: number; end: number; weight: number }[] = []
    let cursor = minYear
    while (cursor <= currentYear) {
      if (yearSet.has(cursor)) {
        // The current year ends just past "now" so the axis has no dead tail
        const end = cursor === currentYear ? now + 0.12 : cursor + 1
        segments.push({
          start: cursor,
          end,
          weight: cursor === currentYear ? CURRENT_YEAR_WEIGHT * (end - cursor) : 1,
        })
        cursor++
      } else {
        let end = cursor
        while (!yearSet.has(end) && end <= currentYear) end++
        segments.push({ start: cursor, end, weight: GAP_WEIGHT })
        cursor = end
      }
    }
    const totalWeight = segments.reduce((sum, segment) => sum + segment.weight, 0)

    const layout = (width: number) => {
      const unit = (width - PAD_X * 2) / totalWeight
      const domain = [minYear]
      const range = [PAD_X]
      for (const segment of segments) {
        domain.push(segment.end)
        range.push(range[range.length - 1] + segment.weight * unit)
      }
      const scale = scaleLinear().domain(domain).range(range)
      const topEnds: number[] = []
      const bottomEnds: number[] = []
      const fit = (ends: number[], left: number) => {
        const index = ends.findIndex((end) => left - end >= CARD_GAP)
        return index === -1 ? ends.length : index
      }
      const cards = items.map((item) => {
        const dotX = scale(item.year)
        const left = clamp(dotX - CARD_W / 2, EDGE_PAD, width - CARD_W - EDGE_PAD)
        const topLane = fit(topEnds, left)
        const bottomLane = fit(bottomEnds, left)
        const preferTop = item.kind === "oss"
        const side: "top" | "bottom" =
          topLane === bottomLane ? (preferTop ? "top" : "bottom") : topLane < bottomLane ? "top" : "bottom"
        const lane = side === "top" ? topLane : bottomLane
        const ends = side === "top" ? topEnds : bottomEnds
        if (lane === ends.length) ends.push(left + CARD_W)
        else ends[lane] = left + CARD_W
        return { item, dotX, left, side, lane }
      })
      return { scale, cards, top: topEnds.length, bottom: bottomEnds.length }
    }

    // Widen (scrollable) until the lanes fit the available height without overlap
    let base = Math.max(size.width, MIN_WIDTH)
    let result = layout(base)
    for (
      let attempt = 0;
      attempt < 8 && (result.top > maxLanesTop || result.bottom > maxLanesBottom);
      attempt++
    ) {
      base *= 1.2
      result = layout(base)
    }
    // Shrink is floored at MIN_WIDTH (or the window if narrower), then centered
    const width = Math.max(base * zoom, Math.min(size.width, MIN_WIDTH))
    if (width !== base) result = layout(width)

    return {
      x: result.scale,
      entryYears: segments.filter((s) => s.weight >= 1).map((s) => s.start),
      placed: result.cards,
      innerWidth: width,
      baseWidth: base,
      lanesTop: result.top,
      lanesBottom: result.bottom,
    }
  }, [items, size.width, now, currentYear, maxLanesTop, maxLanesBottom, zoom])

  const minZoom = size.width > 0 ? Math.min(1, Math.min(size.width, MIN_WIDTH) / baseWidth) : 0.1
  minZoomRef.current = minZoom

  const stepTop = lanesTop > 1 ? Math.max((topZone - CARD_H) / (lanesTop - 1), 30) : 0
  const stepBottom = lanesBottom > 1 ? Math.max((bottomZone - CARD_H) / (lanesBottom - 1), 30) : 0
  const leader = linkVertical()

  const positional = reduced ? { duration: 0 } : spring

  const ready = size.width > 0 && height > 0

  // Skip year labels that would collide with the previous one; the current year always wins
  const labelYears = useMemo(() => {
    const kept: { year: number; center: number }[] = []
    for (const year of entryYears) {
      const center = x(year)
      const previous = kept[kept.length - 1]
      if (previous && center - previous.center < 44) {
        if (year !== currentYear) continue
        kept.pop()
      }
      kept.push({ year, center })
    }
    return new Set(kept.map((label) => label.year))
  }, [entryYears, x, currentYear])

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      onClick={() => setSelectedId(null)}
    >
      <div
        className="absolute bottom-3 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-full bg-surface/80 py-1 pl-4 pr-1.5 shadow-sm ring-1 ring-separator backdrop-blur"
        onClick={(event) => event.stopPropagation()}
      >
        {(
          [
            ["var(--tint)", "Work"],
            ["var(--oss)", "Open Source"],
          ] as const
        ).map(([color, label]) => (
          <span
            key={label}
            className="flex items-center gap-1.5 whitespace-nowrap font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-steel"
          >
            <span className="size-2 shrink-0 rounded-full" style={{ background: color }} />
            {label}
          </span>
        ))}
        <div className="flex items-center gap-0.5 border-l border-separator pl-2">
          <button
            aria-label="Zoom out"
            disabled={zoom <= minZoom}
            onClick={() => zoomBy(1 / 1.5)}
            className="flex size-7 cursor-pointer items-center justify-center rounded-full text-base text-steel transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
          >
            −
          </button>
          <button
            aria-label="Zoom in"
            disabled={zoom >= ZOOM_MAX}
            onClick={() => zoomBy(1.5)}
            className="flex size-7 cursor-pointer items-center justify-center rounded-full text-base text-steel transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
          >
            +
          </button>
        </div>
      </div>

      {ready && (
        <div
          ref={scrollRef}
          onPointerDown={onPanDown}
          onPointerMove={onPanMove}
          onPointerUp={onPanEnd}
          onPointerCancel={onPanEnd}
          onClickCapture={onPanClickCapture}
          className={`h-full select-none overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            innerWidth > size.width ? (panning ? "cursor-grabbing" : "cursor-grab") : ""
          }`}
        >
          <div className="relative mx-auto h-full" style={{ width: innerWidth }}>
            <svg
              className="absolute inset-0"
              width={innerWidth}
              height={height}
              aria-hidden
            >
              {/* Now cursor */}
              <line
                x1={x(now)}
                y1={12}
                x2={x(now)}
                y2={height - 12}
                stroke="var(--tint)"
                strokeOpacity={0.25}
                strokeDasharray="2 4"
              />

              {/* Axis */}
              <motion.line
                x1={PAD_X}
                y1={axisY}
                x2={innerWidth - PAD_X}
                y2={axisY}
                stroke="var(--steel)"
                strokeOpacity={0.35}
                strokeWidth={1}
                initial={reduced ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />

              {/* Year ticks + labels (entry years only) */}
              {entryYears.map((year) => (
                <motion.g key={year} animate={{ x: x(year) }} transition={positional}>
                  <line
                    x1={0}
                    y1={axisY - 6}
                    x2={0}
                    y2={axisY + 6}
                    stroke="var(--steel)"
                    strokeOpacity={0.6}
                  />
                  {labelYears.has(year) && (
                    <text
                      x={0}
                      y={axisY + 22}
                      textAnchor="middle"
                      className={
                        year === currentYear
                          ? "fill-ink font-mono text-[11px] font-semibold"
                          : "fill-steel/70 font-mono text-[10px]"
                      }
                    >
                      {year}
                    </text>
                  )}
                </motion.g>
              ))}

              {/* Work role duration spans */}
              {placed.map(({ item }) =>
                item.kind === "work" && item.endYear ? (
                  <motion.line
                    key={`span-${item.id}`}
                    y1={axisY}
                    y2={axisY}
                    stroke="var(--tint)"
                    strokeWidth={4}
                    strokeLinecap="round"
                    initial={{
                      x1: x(item.year),
                      x2: Math.max(x(item.endYear), x(item.year) + 2),
                      opacity: 0.25,
                    }}
                    animate={{
                      x1: x(item.year),
                      x2: Math.max(x(item.endYear), x(item.year) + 2),
                      opacity:
                        hoveredId === item.id || selectedId === item.id ? 0.9 : 0.25,
                    }}
                    transition={positional}
                  />
                ) : null
              )}

              {/* Leader lines */}
              {placed.map(({ item, dotX, left, side, lane }, index) => {
                const anchorY =
                  side === "top"
                    ? axisY - AXIS_GAP - lane * stepTop
                    : axisY + AXIS_GAP_BELOW + lane * stepBottom
                // Drawn dot-first so the entrance stroke arrives at the card
                const path =
                  leader({
                    source: [dotX, side === "top" ? axisY - 8 : axisY + 8],
                    target: [left + CARD_W / 2, anchorY],
                  }) ?? ""
                const active = selectedId === item.id || hoveredId === item.id
                const dimmed = selectedId !== null && selectedId !== item.id
                return (
                  <motion.path
                    key={`leader-${item.id}`}
                    fill="none"
                    stroke={active ? (item.kind === "work" ? "var(--tint)" : "var(--oss)") : "var(--separator)"}
                    strokeWidth={active ? 1.5 : 1}
                    initial={
                      reduced ? { d: path, opacity: 1 } : { d: path, pathLength: 0, opacity: 0 }
                    }
                    animate={{ d: path, pathLength: 1, opacity: dimmed ? 0.25 : 1 }}
                    transition={
                      reduced
                        ? { duration: 0 }
                        : entered
                          ? { duration: 0.3, ease: "easeOut" }
                          : {
                              // Path geometry must never lag behind the cards
                              d: { duration: 0.3, ease: "easeOut" },
                              pathLength: {
                                duration: 0.35,
                                ease: "easeOut",
                                delay: 0.45 + index * 0.045,
                              },
                              opacity: { duration: 0.35, delay: 0.45 + index * 0.045 },
                            }
                    }
                  />
                )
              })}

              {/* Dots */}
              {placed.map(({ item, dotX }, index) => {
                const active = selectedId === item.id || hoveredId === item.id
                const dimmed = selectedId !== null && selectedId !== item.id
                const color = item.kind === "work" ? "var(--tint)" : "var(--oss)"
                return (
                  <g key={`dot-${item.id}`}>
                    <motion.circle
                      cy={axisY}
                      r={5}
                      fill={color}
                      stroke="var(--bg)"
                      strokeWidth={2}
                      style={{ transformBox: "fill-box", transformOrigin: "center" }}
                      initial={
                        reduced ? { cx: dotX, opacity: 1 } : { cx: dotX, scale: 0, opacity: 1 }
                      }
                      animate={{ cx: dotX, scale: active ? 1.45 : 1, opacity: dimmed ? 0.35 : 1 }}
                      transition={
                        reduced
                          ? { duration: 0 }
                          : entered
                            ? spring
                            : { ...spring, scale: { ...spring, delay: 0.25 + index * 0.045 } }
                      }
                    />
                    <circle
                      cx={dotX}
                      cy={axisY}
                      r={14}
                      fill="transparent"
                      className="cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation()
                        setSelectedId((id) => (id === item.id ? null : item.id))
                      }}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    />
                  </g>
                )
              })}

              {/* Pulse at now */}
              {!reduced && (
                <motion.circle
                  cx={x(now)}
                  cy={axisY}
                  r={5}
                  fill="none"
                  stroke="var(--tint)"
                  strokeWidth={1.5}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                  animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
              )}
            </svg>

            {/* Cards */}
            {placed.map(({ item, dotX, left, side, lane }, index) => {
              const expanded = selectedId === item.id
              const dimmed = selectedId !== null && !expanded
              const expandedHeight = Math.min(
                measured[item.id] ?? estimateExpandedHeight(item),
                height - 16
              )
              const collapsedTop =
                side === "top"
                  ? axisY - AXIS_GAP - lane * stepTop - CARD_H
                  : axisY + AXIS_GAP_BELOW + lane * stepBottom
              // Expanded cards grow away from the axis, clamped inside the container
              const top = expanded
                ? side === "top"
                  ? Math.max(8, collapsedTop + CARD_H - expandedHeight)
                  : Math.min(collapsedTop, height - 8 - expandedHeight)
                : collapsedTop
              const width = expanded ? CARD_EXPANDED_W : CARD_W
              const cardLeft = expanded
                ? clamp(dotX - CARD_EXPANDED_W / 2, EDGE_PAD, innerWidth - CARD_EXPANDED_W - EDGE_PAD)
                : left
              const color = item.kind === "work" ? "var(--tint)" : "var(--oss)"
              return (
                <motion.div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  aria-expanded={expanded}
                  onClick={(event) => {
                    event.stopPropagation()
                    setSelectedId((id) => (id === item.id ? null : item.id))
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      setSelectedId((id) => (id === item.id ? null : item.id))
                    }
                  }}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  initial={{
                    left,
                    top: collapsedTop,
                    width: CARD_W,
                    height: CARD_H,
                    opacity: reduced ? 1 : 0,
                    y: reduced ? 0 : side === "top" ? 12 : -12,
                  }}
                  animate={{
                    left: cardLeft,
                    top,
                    width,
                    height: expanded ? expandedHeight : CARD_H,
                    opacity: dimmed ? 0.35 : 1,
                    y: 0,
                  }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : entered
                        ? spring
                        : {
                            ...spring,
                            y: { ...spring, delay: 0.35 + index * 0.045 },
                            opacity: { duration: 0.4, delay: 0.35 + index * 0.045 },
                          }
                  }
                  style={{ zIndex: expanded ? 40 : hoveredId === item.id ? 30 : 10 }}
                  className={`absolute cursor-pointer select-none overflow-hidden rounded-xl bg-surface p-2.5 text-left shadow-sm outline-none ring-1 ring-separator transition-shadow focus-visible:ring-2 focus-visible:ring-tint ${
                    expanded ? "shadow-lg" : "hover:shadow-md"
                  }`}
                >
                  <div
                    ref={(node) => {
                      contentRefs.current[item.id] = node
                    }}
                  >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ background: color }}
                    />
                    <span className="truncate font-mono text-[10px] leading-none tracking-wide text-steel">
                      {item.period}
                    </span>
                  </div>
                  <h3 className="mt-1 truncate text-[13px] font-semibold leading-tight tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] leading-tight text-steel">
                    {item.kind === "oss" ? (
                      <>
                        <StarIcon className="size-3 shrink-0 text-amber-500" />
                        {item.stars?.toLocaleString("en-US")}
                      </>
                    ) : (
                      item.role
                    )}
                  </p>
                  {expanded && (
                    <motion.div
                      initial={reduced ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.25, delay: 0.1 }}
                    >
                      <p className="mt-2 text-xs leading-relaxed text-steel">{item.desc}</p>
                      {item.tech.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          {item.tech.map((tech) => (
                            <TechIcon key={tech} name={tech} />
                          ))}
                        </div>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="mt-2.5 inline-block text-xs font-medium text-tint hover:underline"
                        >
                          {item.kind === "oss" ? "View on GitHub →" : "Visit →"}
                        </a>
                      )}
                    </motion.div>
                  )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
