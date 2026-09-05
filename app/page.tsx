import { Experience } from "@/components/experience"
import { Intro } from "@/components/intro"
import { Reveal } from "@/components/reveal"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowIcon, GitHubIcon, StarIcon } from "@/components/icons"
import { TechIcon } from "@/components/tech-icons"
import { Timeline, type TimelineProject } from "@/components/timeline"
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

type Repo = {
  name: string
  full_name: string
  description: string | null
  stargazers_count: number
  html_url: string
  fork: boolean
  languages_url: string
  created_at: string
  pushed_at: string
}

async function getRepo(fullName: string): Promise<Repo | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${fullName}`, {
      headers: GITHUB_HEADERS,
      next: { revalidate: 3600 },
    })
    return res.ok ? res.json() : null
  } catch {
    return null
  }
}

async function getProjects(): Promise<TimelineProject[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${profile.github}/repos?per_page=100&sort=pushed`,
      { headers: GITHUB_HEADERS, next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const repos: Repo[] = await res.json()
    const featured = (await Promise.all(profile.featured.map(getRepo))).filter(
      (repo): repo is Repo => repo !== null
    )
    const combined = [
      ...repos
        .filter((repo) => !repo.fork && repo.description && repo.name !== profile.github)
        .slice(0, 6),
      ...featured,
    ].sort((a, b) => +new Date(b.pushed_at) - +new Date(a.pushed_at))
    return Promise.all(
      combined.map(async (repo) => ({
        // Repos outside the profile account keep their owner prefix
        name: repo.full_name.startsWith(`${profile.github}/`) ? repo.name : repo.full_name,
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

export default async function Home() {
  const projects = await getProjects()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="site-header shell">
        <a href="#" className="wordmark" aria-label={`${profile.name}, home`}>
          @lodev09
        </a>
        <nav aria-label="Main navigation" className="main-nav">
          <a href="#work">Work</a>
          <a href="#journey">Journey</a>
          <a href="#contact" className="nav-contact">
            Let’s talk <ArrowIcon className="size-3.5" />
          </a>
        </nav>
        <ThemeToggle />
      </header>

      <main id="main">
        <div className="shell">
          <Intro />
        </div>

        <div className="company-strip shell">
          <p className="eyebrow">Good company.<br />Great things built together.</p>
          <div className="company-names">
            {profile.experience.filter((job) => "logo" in job).map((job) => (
              <a
                key={job.company}
                href={"url" in job ? job.url : undefined}
                target="_blank"
                rel="noreferrer"
              >
                {job.company.replace(" Pty Ltd", "").replace(" US", "")}
              </a>
            ))}
          </div>
        </div>

        <section id="work" className="section shell" aria-labelledby="work-heading">
          <Reveal className="section-heading">
            <div>
              <p className="eyebrow"><span>01 /</span> Out in the open</p>
              <h2 id="work-heading">
                Made for real.<br /><span className="text-steel">Shared with everyone.</span>
              </h2>
            </div>
            <p className="section-description">
              Tools I build, use, and put out into the world. A little contribution to a better
              developer experience.
            </p>
          </Reveal>
          <div className="project-grid">
            {projects.map((project, index) => (
              <Reveal key={project.name} delay={(index % 2) * 0.06}>
                <a href={project.url} target="_blank" rel="noreferrer" className="project-card group">
                  <div className="project-card-top">
                    <span className="project-number">
                      {String(index + 1).padStart(2, "0")} <span>/ OPEN SOURCE</span>
                    </span>
                    <ArrowIcon className="project-arrow size-5" />
                  </div>
                  <div className="project-glyph" aria-hidden>
                    {index % 3 === 0 ? (
                      <span className="glyph-stack"><i /><i /><i /></span>
                    ) : index % 3 === 1 ? (
                      <span className="glyph-brackets">{"{ }"}</span>
                    ) : (
                      <span className="glyph-orbit"><i /><i /><i /></span>
                    )}
                  </div>
                  <h3>{project.name}</h3>
                  <p className="project-description">{project.desc}</p>
                  <div className="project-card-bottom">
                    <div className="flex flex-wrap items-center gap-3">
                      {project.languages.map((language) => <TechIcon key={language} name={language} />)}
                    </div>
                    <span className="project-stars">
                      <StarIcon className="size-3.5" />{project.stars.toLocaleString("en-US")}
                    </span>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
          <a
            href={`https://github.com/${profile.github}?tab=repositories`}
            target="_blank"
            rel="noreferrer"
            className="repository-link"
          >
            <GitHubIcon className="size-4" />
            {projects.length ? "There’s more where that came from" : "Explore my open-source projects on GitHub"}
            <ArrowIcon className="size-4" />
          </a>
        </section>

        <section id="journey" className="journey-section" aria-labelledby="journey-heading">
          <Reveal className="section-heading shell">
            <div>
              <p className="eyebrow"><span>02 /</span> Always building</p>
              <h2 id="journey-heading">
                A work in progress.<br /><span className="text-steel">Since 2009.</span>
              </h2>
            </div>
            <p className="section-description">
              From my first line of code to leading mobile teams. Every chapter adds something.
              <span className="timeline-hint">Drag to explore · Select a moment</span>
            </p>
          </Reveal>
          <div className="timeline-frame">
            <Timeline projects={projects} />
          </div>
          <Reveal className="shell">
            <Experience />
          </Reveal>
        </section>

        <section className="about-section shell" aria-labelledby="about-heading">
          <Reveal className="about-layout">
            <p className="eyebrow"><span>03 /</span> The person behind the pixels</p>
            <div>
              <h2 id="about-heading">Self-taught.<br />Never done learning.</h2>
              <p>{profile.bio}</p>
              <div className="about-note">
                <span className="status-dot" /> Based in the Philippines. Building for everywhere.
              </div>
            </div>
          </Reveal>
        </section>

        <footer id="contact" className="contact-section shell">
          <Reveal>
            <div className="contact-top">
              <p className="eyebrow">Good things start with a conversation</p>
              <span className="contact-asterisk" aria-hidden>✳</span>
            </div>
            <a href={`mailto:${profile.email}`} className="contact-link">
              Let’s make<br />something <em>great.</em><ArrowIcon />
            </a>
            <a href={`mailto:${profile.email}`} className="contact-email">
              {profile.email} <ArrowIcon className="size-4" />
            </a>
          </Reveal>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} {profile.name}</p>
            <p>Built with React. Native at heart.</p>
            <a href="#">Back to top ↑</a>
          </div>
        </footer>
      </main>
    </>
  )
}
