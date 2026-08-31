"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import profile from "@/data/profile.json"
import { formatPeriod } from "@/lib/period"
import { TechIcon } from "./tech-icons"

const VISIBLE = 3
const spring = { type: "spring", stiffness: 170, damping: 26 } as const

export function Experience() {
  const [showAll, setShowAll] = useState(false)
  const reduced = useReducedMotion()
  const jobs = showAll ? profile.experience : profile.experience.slice(0, VISIBLE)

  return (
    <section>
      <h2 className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-steel">
        Experience
      </h2>
      <div className="mt-6 space-y-8">
        {jobs.map((job, i) => (
          <motion.div
            key={job.company}
            initial={!reduced && i >= VISIBLE ? { opacity: 0, y: 12 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: Math.max(0, i - VISIBLE) * 0.04 }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h3 className="text-[15px] font-semibold tracking-tight">
                {"url" in job ? (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-tint"
                  >
                    {job.company}
                  </a>
                ) : (
                  job.company
                )}
              </h3>
              <p className="font-mono text-xs text-steel">{formatPeriod(job.start, job.end)}</p>
            </div>
            <p className="mt-0.5 text-sm font-medium">{job.role}</p>
            <p className="mt-1 text-sm leading-relaxed text-steel">{job.desc}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              {job.tech.map((tech) => (
                <TechIcon key={tech} name={tech} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      <button
        onClick={() => setShowAll((value) => !value)}
        className="mt-7 cursor-pointer text-sm font-medium text-tint hover:underline"
      >
        {showAll ? "Show less ↑" : `Show all ${profile.experience.length} roles ↓`}
      </button>
    </section>
  )
}
