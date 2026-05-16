'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import BottomNav from '../components/BottomNav'

function Avatar({ name, photoUrl, size = 80 }) {
  if (photoUrl) {
    return <img src={photoUrl} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
  }
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

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [photo, setPhoto] = useState(null)

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
      const { error: deleteError } = await supabase.storage.from('avatars').remove([fileName])
      
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      
      const { error: updateError } = await supabase.from('users').update({ photo_url: data.publicUrl }).eq('id', user.id)
      if (updateError) throw updateError

      setUser({ ...user, photo_url: data.publicUrl })
      setPhoto(null)
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1B14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#52B788' }}>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1B14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#ff6b6b' }}>Not logged in</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B14', maxWidth: 430, margin: '0 auto' }}>
      <div style={{ background: '#122018', borderBottom: '1px solid #2D6A4F33', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 10 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', margin: 0, fontSize: 18, fontWeight: 800 }}>My Profile</h2>
      </div>

      <div style={{ padding: '24px 20px', paddingBottom: 100 }}>
        <div style={{ background: '#122018', border: '1px solid #2D6A4F33', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <Avatar name={user.name} photoUrl={user.photo_url} size={100} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, borderRadius: '50%', background: '#52B788', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #122018', fontSize: 18 }}>
                📷
              </div>
            </div>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
              if (e.target.files[0]) {
                setPhoto(e.target.files[0])
                handlePhotoUpload(e.target.files[0])
              }
            }} disabled={uploading} />
          </label>

          <p style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontSize: 18, fontWeight: 700, margin: '16px 0 4px' }}>{user.name}</p>
          <p style={{ fontFamily: "'Lato', sans-serif", color: '#52B788', fontSize: 13, margin: 0 }}>📍 {user.residence}</p>

          <div style={{ marginTop: 24, width: '100%', borderTop: '1px solid #2D6A4F33', paddingTop: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: '#95C9A0', fontWeight: 700, letterSpacing: 1, margin: '0 0 6px' }}>NAME</p>
              <p style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontSize: 15, fontWeight: 700, margin: 0 }}>{user.name}</p>
            </div>
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: '#95C9A0', fontWeight: 700, letterSpacing: 1, margin: '0 0 6px' }}>RESIDENCE</p>
              <p style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontSize: 15, fontWeight: 700, margin: 0 }}>{user.residence}</p>
            </div>
            <div>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: '#95C9A0', fontWeight: 700, letterSpacing: 1, margin: '0 0 6px' }}>STATUS</p>
              <p style={{ fontFamily: "'Sora', sans-serif", color: user.is_committee ? '#52B788' : '#95C9A0', fontSize: 15, fontWeight: 700, margin: 0 }}>
                {user.is_committee ? '👮 Committee Member' : '👤 Member'}
              </p>
            </div>
          </div>

          {uploading && <p style={{ fontFamily: "'Lato', sans-serif", color: '#52B788', fontSize: 12, marginTop: 12 }}>Uploading photo...</p>}
        </div>
      </div>

      <BottomNav />
    </div>
  )
    }
