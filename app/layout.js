export const metadata = {
  title: 'Kiruare Youth Welfare',
  description: 'Community platform for Kiruare Youth',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;700;800&family=Lato:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, background: '#0D1B14' }}>
        {children}
      </body>
    </html>
  )
}
