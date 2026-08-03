'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // login fields
  const [loginName, setLoginName] = useState('')
  const [loginResidence, setLoginResidence] = useState('')

  // signup fields
  const [name, setName] = useState('')
  const [residence, setResidence] = useState('')
  const [phone, setPhone] = useState('')

  function switchMode(next) {
    setMode(next)
    setError('')
    setSuccess('')
  }

  async function handleLogin() {
    if (!loginName.trim() || !loginResidence.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await supabase.from('users').select('id, name, residence')
      if (res.error) throw res.error
      const match = res.data.find(u =>
        u.name.trim().toLowerCase() === loginName.trim().toLowerCase() &&
        u.residence.trim().toLowerCase() === loginResidence.trim().toLowerCase()
      )
      if (!match) throw new Error('No account found. Check your name and residence, or sign up below.')
      localStorage.setItem('kiruare_user_id', match.id)
      router.push('/members')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignup() {
    if (!name.trim() || !residence.trim()) return
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const existingRes = await supabase.from('users').select('id, name, residence')
      if (existingRes.error) throw existingRes.error

      const dup = existingRes.data.find(u =>
        u.name.trim().toLowerCase() === name.trim().toLowerCase() &&
        u.residence.trim().toLowerCase() === residence.trim().toLowerCase()
      )
      if (dup) {
        throw new Error('Looks like you already have an account with this name and residence. Try logging in instead.')
      }

      const insertRes = await supabase
        .from('users')
        .insert({
          name: name.trim(),
          residence: residence.trim(),
          phone: phone.trim() || null,
        })
        .select('id')
        .single()

      if (insertRes.error) throw insertRes.error

      localStorage.setItem('kiruare_user_id', insertRes.data.id)
      setSuccess('Welcome to Kiruari Youth! Taking you in...')
      setTimeout(() => router.push('/members'), 900)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: '#0D1B14',
    border: '1px solid #2D6A4F55',
    borderRadius: 10,
    padding: '12px 14px',
    color: '#E8F5E9',
    fontFamily: "'Lato', sans-serif",
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  }

  const labelStyle = {
    fontFamily: "'Lato', sans-serif",
    fontSize: 12,
    color: '#95C9A0',
    display: 'block',
    marginBottom: 6,
    fontWeight: 600,
    letterSpacing: 1,
  }

  const canSubmitLogin = loginName.trim() && loginResidence.trim()
  const canSubmitSignup = name.trim() && residence.trim()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 0%, #16281f 0%, #0D1B14 60%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .kiruari-card { animation: fadeUp 0.5s ease; }
        .kiruari-logo { animation: gentleFloat 4s ease-in-out infinite; }
        .kiruari-input:focus {
          border-color: #52B788 !important;
          box-shadow: 0 0 0 3px #52B78833;
        }
        .kiruari-tab {
          transition: background 0.2s ease, color 0.2s ease;
        }
        .kiruari-btn:not(:disabled):hover {
          filter: brightness(1.08);
        }
        .kiruari-btn:not(:disabled):active {
          transform: scale(0.98);
        }
      `}</style>

      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div className="kiruari-logo" style={{
          width: 76, height: 76, borderRadius: '50%',
          background: 'linear-gradient(135deg,#2D6A4F,#52B788)',
          margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px #2D6A4F55',
        }}>
          <span style={{ fontSize: 34 }}>🌿</span>
        </div>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 26, color: '#E8F5E9', margin: 0 }}>
          Karibu, Kiruari Youth!
        </h1>
        <p style={{ fontFamily: "'Lato', sans-serif", color: '#95C9A0', margin: '8px 0 0', fontSize: 14, maxWidth: 280, lineHeight: 1.5 }}>
          A warm corner of home — connect, support each other, and grow together.
        </p>
      </div>

      <div className="kiruari-card" style={{
        background: '#122018',
        border: '1px solid #2D6A4F33',
        borderRadius: 20,
        padding: 8,
        width: '100%',
        maxWidth: 380,
        boxShadow: '0 12px 40px #00000055',
      }}>
        {/* Segmented toggle */}
        <div style={{ display: 'flex', background: '#0D1B14', borderRadius: 14, padding: 4, marginBottom: 20 }}>
          <button
            className="kiruari-tab"
            onClick={() => switchMode('login')}
            style={{
              flex: 1, border: 'none', borderRadius: 10, padding: '10px 0', cursor: 'pointer',
              fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14,
              background: mode === 'login' ? 'linear-gradient(135deg,#2D6A4F,#52B788)' : 'transparent',
              color: mode === 'login' ? '#fff' : '#95C9A0',
            }}
          >
            Log In
          </button>
          <button
            className="kiruari-tab"
            onClick={() => switchMode('signup')}
            style={{
              flex: 1, border: 'none', borderRadius: 10, padding: '10px 0', cursor: 'pointer',
              fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14,
              background: mode === 'signup' ? 'linear-gradient(135deg,#2D6A4F,#52B788)' : 'transparent',
              color: mode === 'signup' ? '#fff' : '#95C9A0',
            }}
          >
            Sign Up
          </button>
        </div>

        <div style={{ padding: '0 20px 24px' }}>
          {mode === 'login' ? (
            <>
              <h2 style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontSize: 18, margin: '0 0 6px', fontWeight: 700 }}>
                Welcome back
              </h2>
              <p style={{ fontFamily: "'Lato', sans-serif", color: '#52B788', fontSize: 13, margin: '0 0 20px' }}>
                Good to see you again. Log in with your name and residence.
              </p>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>FULL NAME</label>
                <input className="kiruari-input" value={loginName} onChange={e => setLoginName(e.target.value)}
                  placeholder="e.g. Tom Wanjiku" style={inputStyle} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>RESIDENCE</label>
                <input className="kiruari-input" value={loginResidence} onChange={e => setLoginResidence(e.target.value)}
                  placeholder="e.g. Kiruari Village" style={inputStyle} />
              </div>

              {error && <p style={{ color: '#ff6b6b', fontFamily: "'Lato', sans-serif", fontSize: 13, marginBottom: 12 }}>{error}</p>}

              <button className="kiruari-btn" onClick={handleLogin} disabled={loading || !canSubmitLogin}
                style={{
                  width: '100%', border: 'none', borderRadius: 12, padding: '14px',
                  color: '#fff', fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15,
                  background: canSubmitLogin ? 'linear-gradient(135deg,#2D6A4F,#52B788)' : '#1e3028',
                  cursor: canSubmitLogin ? 'pointer' : 'not-allowed',
                }}>
                {loading ? 'Checking...' : 'Log In →'}
              </button>
            </>
          ) : (
            <>
              <h2 style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontSize: 18, margin: '0 0 6px', fontWeight: 700 }}>
                Join the community
              </h2>
              <p style={{ fontFamily: "'Lato', sans-serif", color: '#52B788', fontSize: 13, margin: '0 0 20px' }}>
                Takes less than a minute. Just the basics to get you in.
              </p>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>FULL NAME</label>
                <input className="kiruari-input" value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Tom Wanjiku" style={inputStyle} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>RESIDENCE</label>
                <input className="kiruari-input" value={residence} onChange={e => setResidence(e.target.value)}
                  placeholder="e.g. Kiruari Village" style={inputStyle} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>PHONE NUMBER (OPTIONAL)</label>
                <input className="kiruari-input" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. 07XX XXX XXX" style={inputStyle} />
              </div>

              {error && <p style={{ color: '#ff6b6b', fontFamily: "'Lato', sans-serif", fontSize: 13, marginBottom: 12 }}>{error}</p>}
              {success && <p style={{ color: '#52B788', fontFamily: "'Lato', sans-serif", fontSize: 13, marginBottom: 12, fontWeight: 600 }}>{success}</p>}

              <button className="kiruari-btn" onClick={handleSignup} disabled={loading || !canSubmitSignup}
                style={{
                  width: '100%', border: 'none', borderRadius: 12, padding: '14px',
                  color: '#fff', fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15,
                  background: canSubmitSignup ? 'linear-gradient(135deg,#2D6A4F,#52B788)' : '#1e3028',
                  cursor: canSubmitSignup ? 'pointer' : 'not-allowed',
                }}>
                {loading ? 'Creating account...' : 'Join Us →'}
              </button>
            </>
          )}
        </div>
      </div>

      <p style={{ fontFamily: "'Lato', sans-serif", color: '#2D6A4F', fontSize: 12, marginTop: 24, textAlign: 'center' }}>
        Kiruari Youth Welfare ·
      </p>
    </div>
  )
  }
              
