'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import BottomNav from '../components/BottomNav'

function Avatar({ name, size = 44 }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const colors = ['#2D6A4F', '#1B4332', '#40916C', '#52B788', '#095D7E', '#1A6B8A']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: size * 0.36, color: '#fff', flexShrink: 0 }}>
      {initials}
    </div>
  )
}

export default function MembersPage() {
  const router = useRouter()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem('kiruare_user_id')
    if (!userId) {
      router.push('/signup')
      return
    }

    async function fetchMembers() {
      try {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false })
        if (error) throw error
        setMembers(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchMembers()
  }, [])

  const committee = members.filter(m => m.is_committee)
  const regular = members.filter(m => !m.is_committee)

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B14', maxWidth: 430, margin: '0 auto' }}>
      <div style={{ background: '#122018', borderBottom: '1px solid #2D6A4F33', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 10 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', margin: 0, fontSize: 18, fontWeight: 800 }}>Members</h2>
        <p style={{ fontFamily: "'Lato', sans-serif", color: '#52B788', margin: '2px 0 0', fontSize: 12 }}>{members.length} members</p>
      </div>

      <div style={{ padding: '16px 20px', paddingBottom: 100 }}>
        {loading ? (
          <p style={{ color: '#52B788', textAlign: 'center', marginTop: 40 }}>Loading...</p>
        ) : (
          <>
            {committee.length > 0 && (
              <>
                <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: '#52B788', fontWeight: 700, letterSpacing: 1.2, margin: '0 0 12px' }}>👮 COMMITTEE MEMBERS</p>
                {committee.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #2D6A4F22' }}>
                    <Avatar name={m.name} size={48} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontWeight: 700, fontSize: 15 }}>{m.name}</p>
                      <p style={{ margin: '2px 0 0', fontFamily: "'Lato', sans-serif", color: '#52B788', fontSize: 12 }}>{m.residence}</p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {regular.length > 0 && (
              <>
                <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: '#52B788', fontWeight: 700, letterSpacing: 1.2, margin: '20px 0 12px' }}>👤 MEMBERS</p>
                {regular.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #2D6A4F22' }}>
                    <Avatar name={m.name} size={48} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontWeight: 700, fontSize: 15 }}>{m.name}</p>
                      <p style={{ margin: '2px 0 0', fontFamily: "'Lato', sans-serif", color: '#52B788', fontSize: 12 }}>{m.residence}</p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {members.length === 0 && <p style={{ color: '#2D6A4F', textAlign: 'center', marginTop: 40 }}>No members yet</p>}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
                  }
                  
