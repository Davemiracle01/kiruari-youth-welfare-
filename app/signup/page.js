'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', residence: '' })
  const [loginName, setLoginName] = useState('')
  const [loginResidence, setLoginResidence] = useState('')
  const [mode, setMode] = useState('signup')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup() {
    if (!form.name || !form.residence) return
    setLoading(true)
    setError('')
    try {
      const { data, error: insertError } = await supabase
        .from('users')
        .insert({ name: form.name, residence: form.residence })
        .select()
        .single()
      if (insertError) throw insertError
      localStorage.setItem('kiruare_user_id', data.id)
      router.push('/members')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin() {
    if (!loginName.trim() || !loginResidence.trim()) return
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .ilike('name', loginName.trim())
        .ilike('residence', loginResidence.trim())
        .single()
      if (error || !data) throw new Error('No account found. Check your name and residence.')
      localStorage.setItem('kiruare_user_id', data.id)
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
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 26, color: '#E8F5E9', margin: 0 }}>Kiruari Youth</h1>
        <p style={{ fontFamily: "'Lato', sans-serif", color: '#52B788', margin: '4px 0 0', fontSize: 14 }}>Welfare & Community Platform</p>
      </div>

      <div style={{ display: 'flex', background: '#122018', border: '1px solid #2D6A4F33', borderRadius: 12, padding: 4, marginBottom: 20, width: '100%', maxWidth: 360 }}>
        <button onClick={() => { setMode('signup'); setError('') }} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, cursor: 'pointer', background: mode === 'signup' ? 'linear-gradient(135deg,#2D6A4F,#52B788)' : 'transparent', color: mode === 'signup' ? '#fff' : '#52B788', fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 13 }}>
          New Member
        </button>
        <button onClick={() => { setMode('login'); setError('') }} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, cursor: 'pointer', background: mode === 'login' ? 'linear-gradient(135deg,#2D6A4F,#52B788)' : 'transparent', color: mode === 'login' ? '#fff' : '#52B788', fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 13 }}>
          Log In
        </button>
      </div>

      <div style={{ background: '#122018', border: '1px solid #2D6A4F33', borderRadius: 20, padding: 28, width: '100%', maxWidth: 360 }}>
        {mode === 'signup' ? (
          <>
            <h2 style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontSize: 18, margin: '0 0 20px', fontWeight: 700 }}>Join the Community</h2>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: '#95C9A0', display: 'block', marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>FULL NAME</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Tom Wanjiku"
                style={{ width: '100%', background: '#0D1B14', border: '1px solid #2D6A4F55', borderRadius: 10, padding: '12px 14px', color: '#E8F5E9', fontFamily: "'Lato', sans-serif", fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: '#95C9A0', display: 'block', marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>RESIDENCE</label>
              <input value={form.residence} onChange={e => setForm({ ...form, residence: e.target.value })} placeholder="e.g. Kiruari Village"
                style={{ width: '100%', background: '#0D1B14', border: '1px solid #2D6A4F55', borderRadius: 10, padding: '12px 14px', color: '#E8F5E9', fontFamily: "'Lato', sans-serif", fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {error && <p style={{ color: '#ff6b6b', fontFamily: "'Lato', sans-serif", fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <button onClick={handleSignup} disabled={loading || !form.name || !form.residence}
              style={{ width: '100%', background: form.name && form.residence ? 'linear-gradient(135deg,#2D6A4F,#52B788)' : '#1e3028', border: 'none', borderRadius: 12, padding: '14px', color: '#fff', fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15, cursor: form.name && form.residence ? 'pointer' : 'not-allowed' }}>
              {loading ? 'Saving...' : 'Join Community →'}
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontSize: 18, margin: '0 0 8px', fontWeight: 700 }}>Welcome Back</h2>
            <p style={{ fontFamily: "'Lato', sans-serif", color: '#52B788', fontSize: 13, margin: '0 0 20px' }}>Use the same name and residence you signed up with.</p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: '#95C9A0', display: 'block', marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>FULL NAME</label>
              <input value={loginName} onChange={e => setLoginName(e.target.value)} placeholder="e.g. Tom Wanjiku"
                style={{ width: '100%', background: '#0D1B14', border: '1px solid #2D6A4F55', borderRadius: 10, padding: '12px 14px', color: '#E8F5E9', fontFamily: "'Lato', sans-serif", fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: '#95C9A0', display: 'block', marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>RESIDENCE</label>
              <input value={loginResidence} onChange={e => setLoginResidence(e.target.value)} placeholder="e.g. Kiruari Village"
                style={{ width: '100%', background: '#0D1B14', border: '1px solid #2D6A4F55', borderRadius: 10, padding: '12px 14px', color: '#E8F5E9', fontFamily: "'Lato', sans-serif", fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {error && <p style={{ color: '#ff6b6b', fontFamily: "'Lato', sans-serif", fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <button onClick={handleLogin} disabled={loading || !loginName.trim() || !loginResidence.trim()}
              style={{ width: '100%', background: loginName && loginResidence ? 'linear-gradient(135deg,#2D6A4F,#52B788)' : '#1e3028', border: 'none', borderRadius: 12, padding: '14px', color: '#fff', fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15, cursor: loginName && loginResidence ? 'pointer' : 'not-allowed' }}>
              {loading ? 'Checking...' : 'Log In →'}
            </button>
          </>
        )}
      </div>
    </div>
  )
          }
