'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import BottomNav from '../components/BottomNav'

function Avatar({ name, photoUrl, size = 100 }) {
  if (photoUrl) {
    return <img src={photoUrl} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '3px solid #52B788' }} />
  }
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const colors = ['#2D6A4F', '#1B4332', '#40916C', '#52B788', '#095D7E', '#1A6B8A']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Sora', sans-serif", fontWeight: 700,
      fontSize: size * 0.36, color: '#fff', border: '3px solid #52B788'
    }}>
      {initials}
    </div>
  )
}

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      try {
        const userId = localStorage.getItem('kiruare_user_id')
        if (!userId) return
        const { data, error } = await supabase.from('users').select('*').eq('id', userId).single()
        if (error) throw error
        setUser(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  async function handlePhotoUpload(file) {
    if (!file || !user) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${user.id}.${ext}`
      await supabase.storage.from('avatars').remove([fileName])
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      const { error: updateError } = await supabase.from('users').update({ photo_url: data.publicUrl }).eq('id', user.id)
      if (updateError) throw updateError
      setUser({ ...user, photo_url: data.publicUrl })
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  function copyIdToClipboard() {
    if (user?.id) {
      navigator.clipboard.writeText(user.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1B14', display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: 430, margin: '0 auto' }}>
        <p style={{ color: '#52B788', fontFamily: "'Lato', sans-serif" }}>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1B14', display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: 430, margin: '0 auto' }}>
        <p style={{ color: '#ff6b6b', fontFamily: "'Lato', sans-serif" }}>Not logged in</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B14', maxWidth: 430, margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #122018 0%, #1a2f28 100%)', borderBottom: '1px solid #2D6A4F33', padding: '20px', position: 'sticky', top: 0, zIndex: 10 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', margin: 0, fontSize: 18, fontWeight: 800 }}>My Profile</h2>
      </div>

      <div style={{ padding: '20px', paddingBottom: 100 }}>
        {/* Photo section */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <label style={{ cursor: uploading ? 'not-allowed' : 'pointer', position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <Avatar name={user.name} photoUrl={user.photo_url} size={110} />
              <div style={{
                position: 'absolute', bottom: -5, right: -5, width: 40, height: 40, borderRadius: '50%',
                background: '#52B788', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid #0D1B14', fontSize: 20, cursor: 'pointer', transition: 'transform 0.2s',
                boxShadow: '0 4px 12px rgba(82, 183, 136, 0.3)'
              }}>
                📷
              </div>
            </div>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
              if (e.target.files[0]) handlePhotoUpload(e.target.files[0])
            }} disabled={uploading} />
          </label>
        </div>

        {/* Name & residence */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <p style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontSize: 20, fontWeight: 800, margin: '0 0 6px' }}>{user.name}</p>
          <p style={{ fontFamily: "'Lato', sans-serif", color: '#52B788', fontSize: 14, margin: 0 }}>📍 {user.residence}</p>
          {user.is_committee && <p style={{ fontFamily: "'Sora', sans-serif", color: '#52B788', fontSize: 12, fontWeight: 700, margin: '6px 0 0', letterSpacing: 1 }}>👮 COMMITTEE MEMBER</p>}
        </div>

        {/* User ID - THE FOCAL POINT */}
        <div style={{
          background: 'linear-gradient(135deg, #1a3a32 0%, #122018 100%)',
          border: '2px solid #52B788',
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          boxShadow: '0 8px 24px rgba(82, 183, 136, 0.15)'
        }}>
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: '#52B788', fontWeight: 800, letterSpacing: 2, margin: '0 0 12px', textTransform: 'uppercase' }}>Your Unique ID</p>
          <p style={{
            fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontSize: 13, fontWeight: 700, margin: 0, marginBottom: 12,
            wordBreak: 'break-all', lineHeight: 1.6
          }}>
            {user.id}
          </p>
          <button
            onClick={copyIdToClipboard}
            style={{
              width: '100%', background: copied ? '#40916C' : '#52B788', border: 'none', borderRadius: 10,
              padding: '10px', color: '#fff', fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 13,
              cursor: 'pointer', transition: 'all 0.3s', letterSpacing: 0.5
            }}
          >
            {copied ? '✓ Copied!' : 'Copy ID'}
          </button>
        </div>

        {/* Info cards */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            background: '#122018', border: '1px solid #2D6A4F33', borderRadius: 12, padding: 16, marginBottom: 12
          }}>
            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: '#95C9A0', fontWeight: 800, letterSpacing: 1, margin: '0 0 6px', textTransform: 'uppercase' }}>Full Name</p>
            <p style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontSize: 15, fontWeight: 700, margin: 0 }}>{user.name}</p>
          </div>

          <div style={{
            background: '#122018', border: '1px solid #2D6A4F33', borderRadius: 12, padding: 16, marginBottom: 12
          }}>
            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: '#95C9A0', fontWeight: 800, letterSpacing: 1, margin: '0 0 6px', textTransform: 'uppercase' }}>Residence</p>
            <p style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontSize: 15, fontWeight: 700, margin: 0 }}>{user.residence}</p>
          </div>

          <div style={{
            background: '#122018', border: '1px solid #2D6A4F33', borderRadius: 12, padding: 16
          }}>
            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: '#95C9A0', fontWeight: 800, letterSpacing: 1, margin: '0 0 6px', textTransform: 'uppercase' }}>Status</p>
            <p style={{
              fontFamily: "'Sora', sans-serif",
              color: user.is_committee ? '#52B788' : '#95C9A0',
              fontSize: 15, fontWeight: 700, margin: 0
            }}>
              {user.is_committee ? '👮 Committee Member' : '👤 Community Member'}
            </p>
          </div>
        </div>

        {uploading && <p style={{ fontFamily: "'Lato', sans-serif", color: '#52B788', fontSize: 12, marginTop: 12, textAlign: 'center' }}>Uploading photo...</p>}
      </div>

      <BottomNav />
    </div>
  )
          }
          
