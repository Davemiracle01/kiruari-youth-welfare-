'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import BottomNav from '../components/BottomNav'

function Avatar({ name, size = 40 }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const colors = ['#2D6A4F', '#1B4332', '#40916C', '#52B788', '#095D7E', '#1A6B8A']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Sora', sans-serif", fontWeight: 700,
      fontSize: size * 0.36, color: '#fff', flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*, users(name)')
          .order('created_at', { ascending: false })
        if (error) throw error
        setAnnouncements(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnnouncements()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B14', maxWidth: 430, margin: '0 auto' }}>
      <div style={{ background: '#122018', borderBottom: '1px solid #2D6A4F33', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 10 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', margin: 0, fontSize: 18, fontWeight: 800 }}>Announcements</h2>
        <p style={{ fontFamily: "'Lato', sans-serif", color: '#52B788', margin: '2px 0 0', fontSize: 12 }}>Committee only</p>
      </div>

      <div style={{ padding: '16px 20px', paddingBottom: 100 }}>
        {loading ? (
          <p style={{ color: '#52B788', textAlign: 'center', marginTop: 40 }}>Loading...</p>
        ) : (
          <>
            {announcements.length > 0 ? (
              announcements.map(a => (
                <div key={a.id} style={{ background: '#122018', border: '1px solid #2D6A4F33', borderRadius: 14, padding: 18, marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                    <Avatar name={a.users?.name || 'Unknown'} size={40} />
                    <div>
                      <p style={{ margin: 0, fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontWeight: 700, fontSize: 14 }}>{a.users?.name}</p>
                      <p style={{ margin: '2px 0 0', fontFamily: "'Lato', sans-serif", color: '#52B788', fontSize: 11 }}>
                        {new Date(a.created_at).toLocaleDateString()} · {new Date(a.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontFamily: "'Lato', sans-serif", color: '#C8E6C9', fontSize: 14, lineHeight: 1.6 }}>{a.content}</p>
                </div>
              ))
            ) : (
              <p style={{ color: '#2D6A4F', textAlign: 'center', marginTop: 40 }}>No announcements yet</p>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
            }
