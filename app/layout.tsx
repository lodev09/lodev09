import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "next-themes"
import profile from "@/data/profile.json"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

const title = `${profile.name} — ${profile.role}`
const description = `${profile.role} at ${profile.company.name}. ${profile.bio}`

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL("https://lodev09.com"),
  alternates: { canonical: "/" },
  authors: [{ name: profile.name, url: "https://lodev09.com" }],
  creator: profile.name,
  openGraph: {
    title,
    description,
    url: "https://lodev09.com",
    siteName: profile.name,
    type: "profile",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@lodev09",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
