"use client"

import { motion, useReducedMotion } from "motion/react"
import profile from "@/data/profile.json"
import { GitHubIcon, LinkedInIcon, MailIcon, XIcon } from "./icons"

const ICONS: Record<string, typeof GitHubIcon> = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  x: XIcon,
  mail: MailIcon,
}

const spring = { type: "spring", stiffness: 150, damping: 24 } as const

export function Intro() {
  const reduced = useReducedMotion()

  const entrance = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { ...spring, delay },
        }

  return (
    <header className="flex flex-col items-center text-center">
      <motion.img
        {...entrance(0)}
        src={profile.avatar}
        alt={profile.name}
        width={80}
        height={80}
        className="size-20 rounded-full ring-1 ring-separator"
      />
      <motion.h1 {...entrance(0.06)} className="mt-5 text-2xl font-semibold tracking-tight">
        {profile.name}
      </motion.h1>
      <motion.a
        {...entrance(0.09)}
        href={`https://github.com/${profile.github}`}
        target="_blank"
        rel="noreferrer"
        className="mt-1 text-sm text-steel transition-colors hover:text-tint"
      >
        @{profile.github}
      </motion.a>
      <motion.p {...entrance(0.12)} className="mt-2 text-[15px] text-steel">
        {profile.role} at{" "}
        <a
          href={profile.company.url}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-ink transition-colors hover:text-tint"
        >
          {profile.company.name}
        </a>
      </motion.p>
      <motion.p
        {...entrance(0.18)}
        className="mt-4 max-w-md text-[15px] leading-relaxed text-steel [text-wrap:balance]"
      >
        {profile.bio}
      </motion.p>
      <motion.div {...entrance(0.24)} className="mt-6 flex items-center gap-1">
        {profile.socials.map((social) => {
          const Icon = ICONS[social.icon]
          return (
            <a
              key={social.label}
              href={social.href}
              target={social.href.startsWith("mailto") ? undefined : "_blank"}
              rel="noreferrer"
              aria-label={social.label}
              className="flex size-9 items-center justify-center rounded-full text-steel transition-all hover:scale-110 hover:bg-surface hover:text-ink"
            >
              <Icon className="size-[18px]" />
            </a>
          )
        })}
      </motion.div>
    </header>
  )
}
