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

export async function getProjects(): Promise<TimelineProject[]> {
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
    const featuredNames = new Set(featured.map((repo) => repo.full_name))
    const byRecency = (a: Repo, b: Repo) => +new Date(b.pushed_at) - +new Date(a.pushed_at)
    const combined = [
      ...featured.sort(byRecency),
      ...repos
        .filter(
          (repo) =>
            !repo.fork &&
            repo.description &&
            repo.stargazers_count > 0 &&
            repo.name !== profile.github &&
            !featuredNames.has(repo.full_name)
        )
        .sort(byRecency)
        .slice(0, 6),
    ]
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
