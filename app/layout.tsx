import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fabric Management App',
  description: 'Ứng dụng quản lý vải và sản xuất',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}