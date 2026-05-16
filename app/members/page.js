'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import BottomNav from '../components/BottomNav'

function Avatar({ name, photoUrl, size = 56 }) {
  if (photoUrl) {
    return <img src={photoUrl} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid #2D6A4F' }} />
  }
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const colors = ['#2D6A4F', '#1B4332', '#40916C', '#52B788', '#095D7E', '#1A6B8A']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: size * 0.36, color: '#fff', flexShrink: 0, border: '2px solid #2D6A4F' }}>
      {initials}
    </div>
  )
}

export default function MembersPage() {
  const router = useRouter()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState(null)

  useEffect(() => {
    const userId = localStorage.getItem('kiruare_user_id')
    if (!userId) { router.push('/signup'); return }

    async function fetchMembers() {
      try {
        const { data, error } = await supabase.from('users').select('*').order('name', { ascending: true })
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

  // Group by first letter
  const grouped = members.reduce((acc, member) => {
    const letter = member.name[0].toUpperCase()
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(member)
    return acc
  }, {})
  const letters = Object.keys(grouped).sort()

  // Member profile modal
  if (selectedMember) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1B14', maxWidth: 430, margin: '0 auto' }}>
        <div style={{ background: '#122018', borderBottom: '1px solid #2D6A4F33', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setSelectedMember(null)} style={{ background: 'none', border: 'none', color: '#52B788', cursor: 'pointer', fontSize: 22 }}>←</button>
          <h2 style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', margin: 0, fontSize: 18, fontWeight: 800 }}>Profile</h2>
        </div>

        <div style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar name={selectedMember.name} photoUrl={selectedMember.photo_url} size={100} />

          <p style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontSize: 22, fontWeight: 800, margin: '20px 0 4px', textAlign: 'center' }}>{selectedMember.name}</p>

          {selectedMember.is_committee && (
            <p style={{ fontFamily: "'Sora', sans-serif", color: '#52B788', fontSize: 12, fontWeight: 700, letterSpacing: 1, margin: '0 0 20px' }}>👮 COMMITTEE MEMBER</p>
          )}

          <div style={{ width: '100%', marginTop: selectedMember.is_committee ? 0 : 20 }}>
            <div style={{ background: '#122018', border: '1px solid #2D6A4F33', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: '#95C9A0', fontWeight: 800, letterSpacing: 1, margin: '0 0 6px', textTransform: 'uppercase' }}>Residence</p>
              <p style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontSize: 15, fontWeight: 700, margin: 0 }}>📍 {selectedMember.residence}</p>
            </div>

            <div style={{ background: '#122018', border: '1px solid #2D6A4F33', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: '#95C9A0', fontWeight: 800, letterSpacing: 1, margin: '0 0 6px', textTransform: 'uppercase' }}>Status</p>
              <p style={{ fontFamily: "'Sora', sans-serif", color: selectedMember.is_committee ? '#52B788' : '#95C9A0', fontSize: 15, fontWeight: 700, margin: 0 }}>
                {selectedMember.is_committee ? '👮 Committee Member' : '👤 Community Member'}
              </p>
            </div>

            <div style={{ background: '#122018', border: '1px solid #2D6A4F33', borderRadius: 12, padding: 16 }}>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: '#95C9A0', fontWeight: 800, letterSpacing: 1, margin: '0 0 6px', textTransform: 'uppercase' }}>Member Since</p>
              <p style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontSize: 15, fontWeight: 700, margin: 0 }}>
                {new Date(selectedMember.created_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B14', maxWidth: 430, margin: '0 auto' }}>
      <div style={{ background: '#122018', borderBottom: '1px solid #2D6A4F33', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 10 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', margin: 0, fontSize: 18, fontWeight: 800 }}>Members</h2>
        <p style={{ fontFamily: "'Lato', sans-serif", color: '#52B788', margin: '2px 0 0', fontSize: 12 }}>{members.length} members</p>
      </div>

      <div style={{ padding: '8px 0', paddingBottom: 100 }}>
        {loading ? (
          <p style={{ color: '#52B788', textAlign: 'center', marginTop: 40 }}>Loading...</p>
        ) : (
          <>
            {letters.map(letter => (
              <div key={letter}>
                {/* Letter header */}
                <div style={{ padding: '8px 20px', background: '#0D1B14', position: 'sticky', top: 57, zIndex: 9 }}>
                  <p style={{ fontFamily: "'Sora', sans-serif", color: '#52B788', fontSize: 13, fontWeight: 800, margin: 0 }}>{letter}</p>
                </div>

                {grouped[letter].map(m => (
                  <button key={m.id} onClick={() => setSelectedMember(m)}
                    style={{ width: '100%', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 14, padding: '10px 20px', borderBottom: '1px solid #2D6A4F15', cursor: 'pointer', textAlign: 'left' }}>
                    <Avatar name={m.name} photoUrl={m.photo_url} size={46} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={{ margin: 0, fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontWeight: 700, fontSize: 14 }}>{m.name}</p>
                        {m.is_committee && <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: '#52B788', fontWeight: 700, background: '#2D6A4F22', padding: '2px 6px', borderRadius: 4 }}>ADMIN</span>}
                      </div>
                      <p style={{ margin: '2px 0 0', fontFamily: "'Lato', sans-serif", color: '#52B788', fontSize: 12 }}>📍 {m.residence}</p>
                    </div>
                    <span style={{ color: '#2D6A4F', fontSize: 18 }}>›</span>
                  </button>
                ))}
              </div>
            ))}

            {members.length === 0 && <p style={{ color: '#2D6A4F', textAlign: 'center', marginTop: 40 }}>No members yet</p>}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
            }
