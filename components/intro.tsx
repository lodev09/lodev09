"use client"

import { motion, useReducedMotion } from "motion/react"
import profile from "@/data/profile.json"
import { ArrowIcon, GitHubIcon, LinkedInIcon, MailIcon, XIcon } from "./icons"
import { NativePlayground } from "./native-playground"

const ICONS: Record<string, typeof GitHubIcon> = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  x: XIcon,
  mail: MailIcon,
}

export function Intro() {
  const reduced = useReducedMotion()
  const entrance = (delay: number) => ({
    initial: reduced ? (false as const) : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  })

  return (
    <section className="hero" aria-labelledby="intro-heading">
      <div className="hero-copy">
        <motion.div {...entrance(0)} className="hero-person">
          <img src={profile.avatar} alt="" width={40} height={40} className="size-10 rounded-full" />
          <div>
            <p>{profile.name}</p>
            <p className="font-mono text-[11px] text-steel">Mobile developer. Quality obsessed.</p>
          </div>
        </motion.div>
        <motion.h1 {...entrance(0.08)} id="intro-heading" className="hero-title">
          Quality takes<br /><em>experience.</em>
        </motion.h1>
        <motion.p {...entrance(0.16)} className="hero-description">
          Self-taught, shipping since 2009, and deep in React Native.{" "}<br className="hidden sm:block" />
          I sweat the details most people skip: late frames, hesitant gestures.{" "}<br className="hidden sm:block" />
          Consistency is the difference between working and feeling right.
        </motion.p>
        <motion.div {...entrance(0.24)} className="hero-actions">
          <a href="#work" className="button-primary">Explore my work <ArrowIcon className="size-4 rotate-45" /></a>
          <a href={`https://github.com/${profile.github}`} target="_blank" rel="noreferrer" className="text-link">
            <GitHubIcon className="size-4" /> GitHub <ArrowIcon className="size-3.5" />
          </a>
        </motion.div>
        <motion.div {...entrance(0.32)} className="hero-current">
          <span className="status-dot" />
          <span>{profile.role} at <a href={profile.company.url} target="_blank" rel="noreferrer">{profile.company.name} ↗</a></span>
        </motion.div>
      </div>
      <motion.div {...entrance(0.2)} className="hero-art"><NativePlayground /></motion.div>
      <motion.div {...entrance(0.4)} className="hero-bottom">
        <span className="eyebrow">Careful by habit. Consistent by choice.</span>
        <div className="flex items-center gap-5">
          {profile.socials.map((social) => {
            const Icon = ICONS[social.icon]
            return (
              <a
                key={social.label}
                href={social.href}
                target={social.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noreferrer"
                aria-label={social.label}
                className="social-link"
              >
                <Icon className="size-4" />
              </a>
            )
          })}
          <span className="social-divider" />
          <a href="#work" className="scroll-link" aria-label="Scroll to work">↓</a>
        </div>
      </motion.div>
    </section>
  )
}
