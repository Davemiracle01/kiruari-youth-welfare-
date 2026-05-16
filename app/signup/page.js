'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', residence: '' })
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!form.name || !form.residence) return
    setLoading(true)
    setError('')

    try {
      let photo_url = null

      if (photo) {
        const ext = photo.name.split('.').pop()
        const fileName = `${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, photo)
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
        photo_url = data.publicUrl
      }

      const { error: insertError } = await supabase
        .from('users')
        .insert({ name: form.name, residence: form.residence, photo_url })

      if (insertError) throw insertError
      router.push('/members')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#2D6A4F,#52B788)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 32 }}>🌿</span>
        </div>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 26, color: '#E8F5E9', margin: 0 }}>Kiruare Youth</h1>
        <p style={{ fontFamily: "'Lato', sans-serif", color: '#52B788', margin: '4px 0 0', fontSize: 14 }}>Welfare & Community Platform</p>
      </div>

      <div style={{ background: '#122018', border: '1px solid #2D6A4F33', borderRadius: 20, padding: 28, width: '100%', maxWidth: 360 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontSize: 18, margin: '0 0 20px', fontWeight: 700 }}>Create Profile</h2>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
          <label style={{ cursor: 'pointer' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', border: '2px dashed #2D6A4F', background: '#0D1B14', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {photo ? <img src={URL.createObjectURL(photo)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 28 }}>📷</span>}
            </div>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setPhoto(e.target.files[0])} />
          </label>
          <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: '#52B788', marginTop: 8 }}>Upload photo</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: '#95C9A0', display: 'block', marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>FULL NAME</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. John Kamau"
            style={{ width: '100%', background: '#0D1B14', border: '1px solid #2D6A4F55', borderRadius: 10, padding: '12px 14px', color: '#E8F5E9', fontFamily: "'Lato', sans-serif", fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: '#95C9A0', display: 'block', marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>RESIDENCE</label>
          <input value={form.residence} onChange={e => setForm({ ...form, residence: e.target.value })} placeholder="e.g. Kiruare Village"
            style={{ width: '100%', background: '#0D1B14', border: '1px solid #2D6A4F55', borderRadius: 10, padding: '12px 14px', color: '#E8F5E9', fontFamily: "'Lato', sans-serif", fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
        </div>

        {error && <p style={{ color: '#ff6b6b', fontFamily: "'Lato', sans-serif", fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <button onClick={handleSubmit} disabled={loading || !form.name || !form.residence}
          style={{ width: '100%', background: form.name && form.residence ? 'linear-gradient(135deg,#2D6A4F,#52B788)' : '#1e3028', border: 'none', borderRadius: 12, padding: '14px', color: '#fff', fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15, cursor: form.name && form.residence ? 'pointer' : 'not-allowed' }}>
          {loading ? 'Saving...' : 'Join Community →'}
        </button>
      </div>
    </div>
  )
      }
