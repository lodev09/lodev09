import type { IconType } from "react-icons"
import {
  SiApple,
  SiC,
  SiCplusplus,
  SiExpo,
  SiGnubash,
  SiHtml5,
  SiJavascript,
  SiKotlin,
  SiMysql,
  SiNodedotjs,
  SiOpenjdk,
  SiPhp,
  SiReact,
  SiRuby,
  SiRust,
  SiSharp,
  SiSwift,
  SiTypescript,
} from "react-icons/si"
import { TbCode } from "react-icons/tb"

const TECH_ICONS: Record<string, { icon: IconType; color: string }> = {
  "React Native": { icon: SiReact, color: "#61dafb" },
  React: { icon: SiReact, color: "#61dafb" },
  Expo: { icon: SiExpo, color: "var(--ink)" },
  TypeScript: { icon: SiTypescript, color: "#3178c6" },
  JavaScript: { icon: SiJavascript, color: "#f7df1e" },
  Swift: { icon: SiSwift, color: "#f05138" },
  Kotlin: { icon: SiKotlin, color: "#7f52ff" },
  "Node.js": { icon: SiNodedotjs, color: "#5fa04e" },
  PHP: { icon: SiPhp, color: "#777bb4" },
  MySQL: { icon: SiMysql, color: "#4479a1" },
  "C#": { icon: SiSharp, color: "#512bd4" },
  "Objective-C": { icon: SiApple, color: "#a2aaad" },
  "Objective-C++": { icon: SiApple, color: "#a2aaad" },
  VB6: { icon: TbCode, color: "var(--steel)" },
  Shell: { icon: SiGnubash, color: "#4eaa25" },
  Rust: { icon: SiRust, color: "var(--ink)" },
  Java: { icon: SiOpenjdk, color: "#437291" },
  Ruby: { icon: SiRuby, color: "#cc342d" },
  C: { icon: SiC, color: "#a8b9cc" },
  "C++": { icon: SiCplusplus, color: "#00599c" },
  HTML: { icon: SiHtml5, color: "#e34f26" },
}

export function TechIcon({ name }: { name: string }) {
  const tech = TECH_ICONS[name] ?? { icon: TbCode, color: "var(--steel)" }

  return (
    <span
      className="group/tech relative flex"
      aria-label={name}
      style={{ "--tech-color": tech.color } as React.CSSProperties}
    >
      <tech.icon
        className="size-4 text-steel transition-colors duration-200 group-hover/tech:[color:var(--tech-color)]"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-0.5 font-mono text-[10px] text-bg opacity-0 transition-all duration-150 group-hover/tech:-translate-y-1 group-hover/tech:opacity-100"
        role="tooltip"
      >
        {name}
      </span>
    </span>
  )
}
