import "@/app/globals.css"
import { AuthProvider } from "@/context/auth-context"

export const metadata = {
  metadataBase: new URL("https://heavenlychat-px42.onrender.com"),
  title: "HeavenlyChat",
  description: "No rules free for all chat",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "HeavenlyChat",
    description: "No rules free for all chat",
    images: ["/icon.png"],
  },
  twitter: {
    card: "summary",
    title: "HeavenlyChat",
    description: "No rules free for all chat",
    images: ["/icon.png"],
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Inter', sans-serif" }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
