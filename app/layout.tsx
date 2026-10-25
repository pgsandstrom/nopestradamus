import "./globals.css"
import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"

import Header from "../components/header.tsx"
import { loginCoverScript } from "../components/login-cover-script.ts"
import LoginCover from "../components/login-cover.tsx"

export const metadata: Metadata = {
  title: "Nopestradamus",
  description: "Service for long term predictions.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#5bbad5" }],
  },
  other: {
    "msapplication-TileColor": "#ffc40d",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#556cd6",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning because the script below writes an attribute onto this element
    // before React ever sees it
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* oxlint-disable-next-line react/no-danger -- our own constant, it has to run before first paint */}
        <script dangerouslySetInnerHTML={{ __html: loginCoverScript }} />
      </head>
      <body>
        <LoginCover />
        <Header />
        {children}
      </body>
    </html>
  )
}
