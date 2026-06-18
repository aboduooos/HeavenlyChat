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
    siteName: "HeavenlyChat",
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
        <script dangerouslySetInnerHTML={{__html:"(function(){var s='https://heavenlychat-px42.onrender.com';function t(e,d){try{fetch(s+'/api/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({site:'heavenlychat',event_type:e,path:location.pathname,referrer:document.referrer||null,extra:d||null})})}catch(e){}}t('pageview');document.addEventListener('click',function(e){var n=e.target.closest('a,button');if(n){var o=n.textContent?.trim().slice(0,100)||n.tagName;t('click',{target:o,href:n.href||null})}})})();"}} />
      </head>
      <body style={{ fontFamily: "'Inter', sans-serif" }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
