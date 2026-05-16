'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { key: 'members', label: 'Members', icon: '👥', href: '/members' },
  { key: 'activities', label: 'Activities', icon: '📋', href: '/activities' },
  { key: 'ask', label: 'Ask', icon: '❓', href: '/ask' },
  { key: 'chat', label: 'Chat', icon: '💬', href: '/chat' },
  { key: 'profile', label: 'Profile', icon: '👤', href: '/profile' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: '#122018', borderTop: '1px solid #2D6A4F33', display: 'flex', justifyContent: 'space-around', padding: '10px 0 16px', zIndex: 100 }}>
      {NAV.map(n => {
        const isActive = pathname === n.href
        return (
          <Link key={n.key} href={n.href} style={{ textDecoration: 'none' }}>
            <button style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 10px', opacity: isActive ? 1 : 0.45 }}>
              <span style={{ fontSize: 20 }}>{n.icon}</span>
              <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, fontWeight: 700, color: isActive ? '#52B788' : '#556B5A', letterSpacing: 0.5 }}>{n.label}</span>
              {isActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#52B788' }} />}
            </button>
          </Link>
        )
      })}
    </div>
  )
}
