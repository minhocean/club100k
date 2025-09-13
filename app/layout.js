import './globals.css'

export const metadata = {
  title: 'Clb100kSport - Google Login',
  description: 'Simple Next.js app with Google authentication using Supabase',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
