import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import "./globals.css"

export const metadata: Metadata = {
  title: "Jovanni Lo — React Native Developer",
  description:
    "Lead React Native Developer at Lugg. Maintainer of react-native-true-sheet and other open-source libraries. Self-taught, passionate about quality.",
  metadataBase: new URL("https://lodev09.com"),
  openGraph: {
    title: "Jovanni Lo — React Native Developer",
    description:
      "Lead React Native Developer at Lugg. Maintainer of react-native-true-sheet and other open-source libraries.",
    url: "https://lodev09.com",
    siteName: "Jovanni Lo",
    type: "website",
  },
  twitter: {
    card: "summary",
    creator: "@lodev09",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
