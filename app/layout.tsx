// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import PwaInstall from '@/components/PwaInstall'
import './globals.css'

export const metadata: Metadata = {
  title: 'HR Dashboard — HQ Group',
  description: 'Báo cáo tuyển dụng HQ Group 2026',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  // Cho phép "Add to Home Screen" trên iOS chạy fullscreen như app
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HQ HR',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#05080F',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        {children}
        <PwaInstall />
      </body>
    </html>
  )
}
