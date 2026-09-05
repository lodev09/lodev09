"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import profile from "@/data/profile.json"
import { formatPeriod } from "@/lib/period"
import { CompanyLogo } from "./company-logo"
import { PinIcon } from "./icons"
import { TechIcon } from "./tech-icons"

const VISIBLE = 3
const spring = { type: "spring", stiffness: 170, damping: 26 } as const

export function Experience() {
  const [showAll, setShowAll] = useState(false)
  const reduced = useReducedMotion()
  const jobs = showAll ? profile.experience : profile.experience.slice(0, VISIBLE)

  return (
    <section className="experience-layout" aria-labelledby="experience-heading">
      <div>
        <h2 id="experience-heading" className="eyebrow">The experience</h2>
        <p className="experience-caption">Different teams.<br />Same attention to detail.</p>
      </div>
      <div>
        <div id="experience-roles">
          {jobs.map((job, i) => (
            <motion.div
              key={job.company}
              initial={!reduced && i >= VISIBLE ? { opacity: 0, y: 12 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: Math.max(0, i - VISIBLE) * 0.04 }}
              className="experience-row flex gap-4"
            >
              <CompanyLogo
                name={job.company}
                logo={"logo" in job ? job.logo : undefined}
                size={40}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h3 className="text-lg font-semibold tracking-tight">
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
                  <p className="font-mono text-[11px] text-steel">{formatPeriod(job.start, job.end)}</p>
                </div>
                <p className="mt-0.5 text-sm font-medium">{job.role}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-steel">
                  <PinIcon className="size-3 shrink-0" />
                  {job.location}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-steel">{job.desc}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  {job.tech.map((tech) => (
                    <TechIcon key={tech} name={tech} />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <button
          onClick={() => setShowAll((value) => !value)}
          aria-expanded={showAll}
          aria-controls="experience-roles"
          className="experience-toggle"
        >
          {showAll ? "Show less ↑" : `Show all ${profile.experience.length} roles ↓`}
        </button>
      </div>
    </section>
  )
}
