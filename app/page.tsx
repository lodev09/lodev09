import { Experience } from "@/components/experience"
import { HomeShell } from "@/components/home-shell"
import { Reveal } from "@/components/reveal"
import { ThemeToggle } from "@/components/theme-toggle"
import { StarIcon } from "@/components/icons"
import { TechIcon } from "@/components/tech-icons"
import type { TimelineProject } from "@/components/timeline"
import profile from "@/data/profile.json"

const GITHUB_HEADERS: HeadersInit = process.env.GITHUB_TOKEN
  ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
  : {}

async function getLanguages(url: string): Promise<string[]> {
  try {
    const res = await fetch(url, { headers: GITHUB_HEADERS, next: { revalidate: 3600 } })
    if (!res.ok) return []
    const bytes: Record<string, number> = await res.json()
    const total = Object.values(bytes).reduce((sum, count) => sum + count, 0)
    return Object.entries(bytes)
      .filter(([, count]) => count / total >= 0.05)
      .slice(0, 4)
      .map(([language]) => language)
  } catch {
    return []
  }
}

async function getProjects(): Promise<TimelineProject[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${profile.github}/repos?per_page=100&sort=pushed`,
      { headers: GITHUB_HEADERS, next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const repos: {
      name: string
      description: string | null
      stargazers_count: number
      html_url: string
      fork: boolean
      languages_url: string
      created_at: string
    }[] = await res.json()
    return Promise.all(
      repos
        .filter((repo) => !repo.fork && repo.description && repo.name !== profile.github)
        .slice(0, 6)
        .map(async (repo) => ({
          name: repo.name,
          desc: repo.description!,
          stars: repo.stargazers_count,
          url: repo.html_url,
          languages: await getLanguages(repo.languages_url),
          createdAt: repo.created_at,
        }))
    )
  } catch {
    return []
  }
}

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  worksFor: { "@type": "Organization", name: profile.company.name, url: profile.company.url },
  url: "https://lodev09.com",
  image: profile.avatar,
  email: `mailto:${profile.email}`,
  sameAs: profile.socials.map((social) => social.href),
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-steel">
      {children}
    </h2>
  )
}

function Grabber() {
  return <div className="grabber mx-auto my-16" aria-hidden />
}

export default async function Home() {
  const projects = await getProjects()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <div className="fixed right-5 top-5 z-50">
        <ThemeToggle />
      </div>

      <HomeShell
        projects={projects}
        list={
          <>
            <Grabber />

            <Reveal>
              <Experience />
            </Reveal>

            <Grabber />

            <Reveal>
              <section>
                <SectionHeading>Open Source</SectionHeading>
                <div className="mt-4">
                  {projects.map((project) => (
                    <a
                      key={project.name}
                      href={project.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group -mx-4 block rounded-2xl px-4 py-3.5 transition-colors hover:bg-surface"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="break-all font-mono text-sm font-medium transition-colors group-hover:text-tint">
                          {project.name}
                        </h3>
                        <span className="flex shrink-0 items-center gap-1 font-mono text-xs text-steel">
                          <StarIcon className="size-3 text-amber-500" />
                          {project.stars.toLocaleString("en-US")}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-steel">{project.desc}</p>
                      {project.languages.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                          {project.languages.map((language) => (
                            <TechIcon key={language} name={language} />
                          ))}
                        </div>
                      )}
                    </a>
                  ))}
                </div>
                <a
                  href={`https://github.com/${profile.github}?tab=repositories`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-sm font-medium text-tint hover:underline"
                >
                  All repositories →
                </a>
              </section>
            </Reveal>

            <Grabber />

            <Reveal>
              <footer className="text-center">
                <p className="text-[15px] text-steel">
                  Did you find anything interesting?{" "}
                  <a
                    href={`mailto:${profile.email}`}
                    className="font-medium text-ink transition-colors hover:text-tint"
                  >
                    Reach out
                  </a>
                </p>
                <p className="mt-8 font-mono text-xs text-steel/70">
                  © {new Date().getFullYear()} {profile.name} · Built with React — ironically, not
                  Native.
                </p>
              </footer>
            </Reveal>
          </>
        }
      />
    </>
  )
}
