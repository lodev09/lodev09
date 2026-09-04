const monogram = (name: string) =>
  name
    .split(/\s+/)
    .filter((word) => /^[A-Za-z]/.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("")

export function LogoTile({
  src,
  size,
  className = "",
  children,
}: {
  src?: string
  size: number
  className?: string
  children?: React.ReactNode
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-2 ring-1 ring-separator ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.32 }}
      aria-hidden
    >
      {src ? (
        <img src={src} alt="" className="size-full object-cover" draggable={false} />
      ) : (
        children
      )}
    </span>
  )
}

export function CompanyLogo({
  name,
  logo,
  size,
  className,
}: {
  name: string
  logo?: string
  size: number
  className?: string
}) {
  return (
    <LogoTile src={logo} size={size} className={className}>
      <span className="font-semibold tracking-wide text-steel">{monogram(name)}</span>
    </LogoTile>
  )
}
