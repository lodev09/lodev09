type Glyph = (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element

function Svg(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 96 72"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  )
}

const tint = { fill: "color-mix(in srgb, currentColor 8%, var(--surface))" }

const GLYPHS: Record<string, Glyph> = {
  tokenmenyu: (props) => (
    <Svg {...props}>
      <rect x="8" y="22" width="80" height="12" rx="6" {...tint} />
      <rect x="8" y="22" width="50" height="12" rx="6" fill="currentColor" />
      <rect x="8" y="40" width="80" height="12" rx="6" {...tint} />
      <rect x="8" y="40" width="22" height="12" rx="6" fill="currentColor" />
    </Svg>
  ),
  neonotes: (props) => (
    <Svg {...props}>
      <rect x="20" y="6" width="56" height="60" rx="8" {...tint} />
      <path d="M32 24h32M32 36h32M32 48h20" />
    </Svg>
  ),
  animenyu: (props) => (
    <Svg {...props}>
      <rect x="10" y="10" width="76" height="52" rx="8" {...tint} />
      <path d="M42 26v20l16-10z" />
    </Svg>
  ),
  neotorrent: (props) => (
    <Svg {...props}>
      <path d="M48 8v36M34 32l14 14 14-14" />
      <path d="M16 56v4a4 4 0 0 0 4 4h56a4 4 0 0 0 4-4v-4" />
    </Svg>
  ),
  "react-native-true-sheet": (props) => (
    <Svg {...props}>
      <rect x="28" y="4" width="40" height="64" rx="8" />
      <path d="M28 40h40v20a8 8 0 0 1-8 8H36a8 8 0 0 1-8-8z" {...tint} />
      <path d="M43 46h10" strokeWidth="2" />
    </Svg>
  ),
  "react-native-true-tabs": (props) => (
    <Svg {...props}>
      <rect x="28" y="4" width="40" height="64" rx="8" />
      <path d="M28 54h40" />
      <circle cx="38" cy="61" r="2" fill="currentColor" />
      <circle cx="48" cy="61" r="2" />
      <circle cx="58" cy="61" r="2" />
    </Svg>
  ),
  "expo-recorder": (props) => (
    <Svg {...props}>
      <rect x="40" y="6" width="16" height="32" rx="8" {...tint} />
      <path d="M32 30a16 16 0 0 0 32 0M48 46v14M38 60h20" />
    </Svg>
  ),
  "react-native-exify": (props) => (
    <Svg {...props}>
      <path d="M12 16h44l24 20-24 20H12a4 4 0 0 1-4-4V20a4 4 0 0 1 4-4z" {...tint} />
      <circle cx="24" cy="36" r="3" />
    </Svg>
  ),
  "claude-sounds": (props) => (
    <Svg {...props}>
      <path d="M22 28h10l14-12v40L32 44H22z" {...tint} />
      <path d="M58 26a14 14 0 0 1 0 20M66 18a26 26 0 0 1 0 36" />
    </Svg>
  ),
  "react-native-cell-components": (props) => (
    <Svg {...props}>
      <rect x="16" y="10" width="64" height="16" rx="5" {...tint} />
      <rect x="16" y="28" width="64" height="16" rx="5" {...tint} />
      <rect x="16" y="46" width="64" height="16" rx="5" {...tint} />
    </Svg>
  ),
  "lugg/maps": (props) => (
    <Svg {...props}>
      <path d="M48 6a18 18 0 0 1 18 18c0 12-18 32-18 32S30 36 30 24A18 18 0 0 1 48 6z" {...tint} />
      <circle cx="48" cy="24" r="6" />
      <path d="M28 64h40" />
    </Svg>
  ),
}

export function ProjectGlyph({ name, index }: { name: string; index: number }) {
  const Icon = GLYPHS[name]
  if (Icon) return <Icon />

  return index % 3 === 0 ? (
    <span className="glyph-stack"><i /><i /><i /></span>
  ) : index % 3 === 1 ? (
    <span className="glyph-brackets">{"{ }"}</span>
  ) : (
    <span className="glyph-orbit"><i /><i /><i /></span>
  )
}
