"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Intro } from "./intro"
import { Timeline, type TimelineProject } from "./timeline"

type View = "list" | "timeline"

const spring = { type: "spring", stiffness: 400, damping: 32 } as const

function ViewToggle({ view, onChange }: { view: View; onChange: (view: View) => void }) {
  return (
    <div
      role="tablist"
      aria-label="View"
      className="mx-auto mt-8 flex w-fit rounded-full bg-surface-2 p-1"
    >
      {(["list", "timeline"] as const).map((value) => (
        <button
          key={value}
          role="tab"
          aria-selected={view === value}
          onClick={() => onChange(value)}
          className={`relative cursor-pointer rounded-full px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-wider transition-colors ${
            view === value ? "text-ink" : "text-steel hover:text-ink"
          }`}
        >
          {view === value && (
            <motion.span
              layoutId="view-toggle-thumb"
              transition={spring}
              className="absolute inset-0 rounded-full bg-surface shadow-sm dark:bg-[#48484a]"
            />
          )}
          <span className="relative">{value}</span>
        </button>
      ))}
    </div>
  )
}

export function HomeShell({
  list,
  projects,
}: {
  list: React.ReactNode
  projects: TimelineProject[]
}) {
  const [view, setView] = useState<View>("list")
  const isTimeline = view === "timeline"

  return (
    <div className={isTimeline ? "flex h-dvh flex-col overflow-hidden" : undefined}>
      <header
        className={`mx-auto w-full max-w-xl px-6 ${
          isTimeline ? "pt-12 sm:pt-14" : "pt-24 sm:pt-28"
        }`}
      >
        <Intro />
        <ViewToggle view={view} onChange={setView} />
      </header>
      {isTimeline ? (
        <section aria-label="Career timeline" className="relative mt-4 min-h-0 w-full flex-1">
          <Timeline projects={projects} />
        </section>
      ) : (
        <main className="mx-auto w-full max-w-xl px-6 pb-24 sm:pb-28">{list}</main>
      )}
    </div>
  )
}
