"use client"

import { useState } from "react"
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react"

const COLLAPSED_Y = 103

export function NativePlayground() {
  const [expanded, setExpanded] = useState(false)
  const reduced = useReducedMotion()
  const y = useMotionValue(COLLAPSED_Y)
  const detailsOpacity = useTransform(y, [0, COLLAPSED_Y], [1, 0])

  const snapTo = (open: boolean) => {
    setExpanded(open)
    animate(
      y,
      open ? 0 : COLLAPSED_Y,
      reduced ? { duration: 0 } : { type: "spring", stiffness: 230, damping: 25 }
    )
  }

  return (
    <div className="playground">
      <div className="playground-orbit orbit-one" aria-hidden />
      <div className="playground-orbit orbit-two" aria-hidden />
      <div className="playground-cross cross-one" aria-hidden>+</div>
      <div className="playground-cross cross-two" aria-hidden>+</div>
      <span className="playground-label eyebrow">A little attention to detail</span>
      <div className="phone">
        <div className="phone-status" aria-hidden><span>9:41</span><span className="phone-island" /><span>▮▮▮ ▰</span></div>
        <div className="phone-content">
          <div className="phone-app-bar"><span className="app-symbol">lo<span>®</span></span><span className="phone-avatar">JL</span></div>
          <p className="phone-eyebrow">THE LITTLE THINGS</p>
          <h2>Done right.<br /><span>Consistently.</span></h2>
          <div className="sculpture" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="sculpture-layer"
                initial={false}
                animate={{ y: expanded ? i * -8 : i * -2, rotate: expanded ? -26 + i * 8 : -26, scale: 1 - i * 0.045 }}
                transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 180, damping: 18, delay: i * 0.025 }}
                style={{ zIndex: i, bottom: 8 + i * 10 }}
              />
            ))}
          </div>
          <div className="phone-detail"><span>Made to move.</span><span>01 / 03</span></div>
          <div className="phone-track"><span /></div>
        </div>
        <motion.div
          className="phone-sheet"
          style={{ y }}
          drag="y"
          dragConstraints={{ top: 0, bottom: COLLAPSED_Y }}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={(_, { velocity }) => snapTo(y.get() + velocity.y * 0.15 < COLLAPSED_Y / 2)}
        >
          <motion.button
            type="button"
            className="sheet-drag-handle"
            aria-label={expanded ? "Collapse sheet" : "Expand sheet"}
            aria-expanded={expanded}
            aria-controls="interaction-details"
            onTap={() => snapTo(!expanded)}
            onKeyDown={(event) => {
              if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                event.preventDefault()
                snapTo(event.key === "ArrowUp")
              }
            }}
          >
            <span className="sheet-handle" aria-hidden />
          </motion.button>
          <div className="sheet-heading"><div><p>Feels different.</p><span>That’s the point.</span></div><span className="sheet-spark" aria-hidden>✳</span></div>
          <motion.div id="interaction-details" className="sheet-details" inert={!expanded} style={{ opacity: detailsOpacity }}>
            <p>A little spring. A little personality.<br />Every interaction, considered.</p>
            <div><span className="status-dot" /> Crafted with care <span>↗</span></div>
          </motion.div>
        </motion.div>
        <div className="phone-home" aria-hidden />
      </div>
      <div className="floating-note"><span className="status-dot" /> Quality you can feel.</div>
      <span className="playground-hint"><span aria-hidden>↕</span> Drag the sheet</span>
      <span className="playground-index eyebrow" aria-hidden>FIG. 001 — THE FEELING</span>
    </div>
  )
}
