import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
// app/layout.tsx



export const metadata: Metadata = {
  title: 'Vserve',
  description: 'Vserve',
  generator: 'vserve',
  icons: {
    icon: '/vserve.jpeg', // default favicon
    shortcut: '/vserve.jpeg',
    apple: '/vserve.jpeg', // optional (for iOS)
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
