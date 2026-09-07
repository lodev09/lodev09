import path from "node:path"
import { Document, Font, Link, Page, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer"
import profile from "@/data/profile.json"
import { formatPeriod } from "@/lib/period"
import type { TimelineProject } from "./timeline"

const FONTS = path.join(process.cwd(), "node_modules/geist/dist/fonts")

Font.register({
  family: "Geist",
  fonts: [
    { src: path.join(FONTS, "geist-sans/Geist-Regular.ttf"), fontWeight: 400 },
    { src: path.join(FONTS, "geist-sans/Geist-Medium.ttf"), fontWeight: 500 },
    { src: path.join(FONTS, "geist-sans/Geist-SemiBold.ttf"), fontWeight: 600 },
  ],
})
Font.register({
  family: "Geist Mono",
  fonts: [
    { src: path.join(FONTS, "geist-mono/GeistMono-Regular.ttf"), fontWeight: 400 },
    { src: path.join(FONTS, "geist-mono/GeistMono-Medium.ttf"), fontWeight: 500 },
  ],
})
Font.registerHyphenationCallback((word) => [word])

const ink = "#23201c"
const steel = "#6b645b"
const tint = "#b8431a"
const separator = "#e0d9cf"
const surface = "#f1ece4"

const styles = StyleSheet.create({
  page: {
    fontFamily: "Geist",
    fontSize: 9.5,
    lineHeight: 1.45,
    color: ink,
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 52,
  },
  mono: { fontFamily: "Geist Mono" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  name: { fontSize: 26, fontWeight: 600, letterSpacing: -0.6, lineHeight: 1.1 },
  role: { fontSize: 12, color: steel, marginTop: 4 },
  contacts: { alignItems: "flex-end", gap: 2 },
  contact: { fontFamily: "Geist Mono", fontSize: 8, color: steel, textDecoration: "none" },
  rule: { height: 1, backgroundColor: separator, marginTop: 18 },
  ruleAccent: { height: 1, width: 48, backgroundColor: tint, marginTop: -1 },
  section: { marginTop: 22 },
  sectionHead: { flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 10 },
  eyebrow: {
    fontFamily: "Geist Mono",
    fontSize: 7.5,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: steel,
  },
  eyebrowIndex: { color: tint },
  summary: { fontSize: 10.5, lineHeight: 1.55, maxWidth: 440 },
  job: { flexDirection: "row", gap: 16, paddingVertical: 9, borderBottom: `0.5 solid ${separator}` },
  jobMeta: { width: 96, gap: 2 },
  jobMetaText: { fontFamily: "Geist Mono", fontSize: 7.5, color: steel, lineHeight: 1.5 },
  jobBody: { flex: 1 },
  jobCompany: { fontSize: 11, fontWeight: 600, letterSpacing: -0.2 },
  jobRole: { fontSize: 9.5, fontWeight: 500, color: steel },
  jobDesc: { marginTop: 3, color: ink },
  jobTech: { fontFamily: "Geist Mono", fontSize: 7.5, color: steel, marginTop: 4 },
  projects: { gap: 10 },
  projectRow: { flexDirection: "row", gap: 10 },
  projectSpacer: { flexGrow: 1, flexBasis: 0, padding: 10 },
  projectCard: {
    flexGrow: 1,
    flexBasis: 0,
    minHeight: 80,
    backgroundColor: surface,
    borderRadius: 4,
    padding: 10,
  },
  projectTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  projectName: { fontSize: 10, fontWeight: 600, color: ink, textDecoration: "none" },
  projectStars: { flexDirection: "row", alignItems: "center", gap: 3 },
  projectStarsText: { fontFamily: "Geist Mono", fontSize: 7.5, lineHeight: 1, color: steel },
  projectDesc: { fontSize: 8.5, color: steel, marginTop: 3, lineHeight: 1.45 },
  projectLangs: { fontFamily: "Geist Mono", fontSize: 7, color: tint, marginTop: 5 },
  skills: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  skill: {
    fontFamily: "Geist Mono",
    fontSize: 7.5,
    lineHeight: 1.2,
    color: ink,
    border: `0.5 solid ${separator}`,
    borderRadius: 3,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  footer: {
    position: "absolute",
    left: 52,
    right: 52,
    bottom: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    fontFamily: "Geist Mono",
    fontSize: 7,
    color: steel,
  },
})

const stripEmoji = (text: string) =>
  text.replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}️]/gu, "").trim()

const shortUrl = (href: string) => href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")

function SectionHead({ index, title }: { index: string; title: string }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.eyebrow}>
        <Text style={styles.eyebrowIndex}>{index} /</Text> {title}
      </Text>
    </View>
  )
}

export function CvDocument({ projects }: { projects: TimelineProject[] }) {
  const since = Math.min(...profile.experience.map((job) => Number(job.start.slice(0, 4))))
  const skills = [...new Set(profile.experience.flatMap((job) => job.tech))]
  const links = profile.socials.filter((social) => social.icon !== "mail")
  const projectRows = Array.from({ length: Math.ceil(projects.length / 2) }, (_, i) =>
    projects.slice(i * 2, i * 2 + 2)
  )
  const generated = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <Document
      title={`${profile.name} — CV`}
      author={profile.name}
      subject={profile.role}
      creator={shortUrl(profile.website)}
      producer={shortUrl(profile.website)}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.footer} fixed>
          <Text>Curriculum vitae</Text>
          <Text>Generated from {shortUrl(profile.website)} · {generated}</Text>
        </View>
        <View style={styles.header}>
          <View>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.role}>{profile.role}</Text>
          </View>
          <View style={styles.contacts}>
            <Link src={`mailto:${profile.email}`} style={styles.contact}>{profile.email}</Link>
            <Link src={profile.website} style={styles.contact}>{shortUrl(profile.website)}</Link>
            {links.map((social) => (
              <Link key={social.label} src={social.href} style={styles.contact}>
                {shortUrl(social.href)}
              </Link>
            ))}
            <Text style={styles.contact}>{profile.location}</Text>
          </View>
        </View>
        <View style={styles.rule} />
        <View style={styles.ruleAccent} />

        <View style={styles.section}>
          <SectionHead index="01" title="Profile" />
          <Text style={styles.summary}>
            {profile.role} at {profile.company.name}, shipping software since {since}.{" "}
            {stripEmoji(profile.bio)}
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHead index="02" title="Experience" />
          {profile.experience.map((job) => (
            <View key={job.company} style={styles.job} wrap={false}>
              <View style={styles.jobMeta}>
                <Text style={styles.jobMetaText}>{formatPeriod(job.start, job.end)}</Text>
                <Text style={styles.jobMetaText}>{job.location}</Text>
              </View>
              <View style={styles.jobBody}>
                <Text style={styles.jobCompany}>
                  {job.company}  <Text style={styles.jobRole}>{job.role}</Text>
                </Text>
                <Text style={styles.jobDesc}>{job.desc}</Text>
                <Text style={styles.jobTech}>{job.tech.join("  ·  ")}</Text>
              </View>
            </View>
          ))}
        </View>

        {projects.length > 0 && (
          <View style={styles.section}>
            <SectionHead index="03" title="Open source" />
            <View style={styles.projects}>
              {projectRows.map((row, i) => (
                <View key={i} style={styles.projectRow} wrap={false}>
                  {row.map((project) => (
                    <View key={project.name} style={styles.projectCard}>
                      <View style={styles.projectTop}>
                        <Link src={project.url} style={styles.projectName}>{project.name}</Link>
                        <View style={styles.projectStars}>
                          <Svg viewBox="0 0 24 24" width={7} height={7} style={{ marginTop: 2 }}>
                            <Path d="M12 2.5 15 9l7 .7-5.3 4.7 1.6 6.9-6.3-3.8-6.3 3.8 1.6-6.9L2 9.7 9 9l3-6.5Z" fill={steel} />
                          </Svg>
                          <Text style={styles.projectStarsText}>{project.stars.toLocaleString("en-US")}</Text>
                        </View>
                      </View>
                      <Text style={styles.projectDesc}>{stripEmoji(project.desc)}</Text>
                      {project.languages.length > 0 && (
                        <Text style={styles.projectLangs}>{project.languages.join("  ·  ")}</Text>
                      )}
                    </View>
                  ))}
                  {row.length === 1 && <View style={styles.projectSpacer} />}
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section} wrap={false}>
          <SectionHead index={projects.length ? "04" : "03"} title="Skills" />
          <View style={styles.skills}>
            {skills.map((skill) => (
              <Text key={skill} style={styles.skill}>{skill}</Text>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  )
}
