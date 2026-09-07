import { renderToBuffer } from "@react-pdf/renderer"
import { CvDocument } from "@/components/cv-document"
import profile from "@/data/profile.json"
import { getProjects } from "@/lib/projects"

export const dynamic = "force-static"

export async function GET() {
  const projects = await getProjects()
  const buffer = await renderToBuffer(CvDocument({ projects }))
  const filename = `${profile.name.replace(/\s+/g, "-")}-CV.pdf`

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  })
}
