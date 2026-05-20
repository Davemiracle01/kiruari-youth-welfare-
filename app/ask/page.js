'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import BottomNav from '../components/BottomNav'

export default function AskPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [questions, setQuestions] = useState([])
  const [myQuestion, setMyQuestion] = useState(null)
  const [newQuestion, setNewQuestion] = useState('')
  const [answerText, setAnswerText] = useState({})
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  const loadQuestions = useCallback(async (userId) => {
    const { data, error: fetchError } = await supabase
      .from('questions')
      .select('id, question, answer, user_id, answered_by, created_at, users(name)')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError('Could not load questions: ' + fetchError.message)
      return
    }

    const list = data || []
    setQuestions(list)

    if (userId) {
      const today = new Date().toISOString().split('T')[0]
      // String() fixes type mismatch — localStorage returns string, DB may return UUID/int
      const mine = list.find(
        q => String(q.user_id) === String(userId) &&
             q.created_at?.slice(0, 10) === today
      )
      setMyQuestion(mine || null)
    }
  }, [])

  useEffect(() => {
    async function init() {
      const userId = localStorage.getItem('kiruare_user_id')
      if (!userId) { router.push('/signup'); return }

      const { data: userData, error: userError } = await supabase
        .from('users').select('*').eq('id', userId).single()

      if (userError || !userData) { router.push('/signup'); return }

      setUser(userData)
      await loadQuestions(userId)
      setLoading(false)
    }
    init()
  }, [router, loadQuestions])

  async function handlePostQuestion() {
    if (!newQuestion.trim()) { setError('Write a question first.'); return }
    if (!user) { setError('Not logged in.'); return }

    setPosting(true)
    setError('')

    const { error: insertError } = await supabase
      .from('questions')
      .insert([{ user_id: user.id, question: newQuestion.trim() }])
      .select()

    if (insertError) {
      setError('Failed to post: ' + insertError.message)
      setPosting(false)
      return
    }

    setNewQuestion('')
    // Small delay so Supabase commits before re-fetch
    await new Promise(r => setTimeout(r, 400))
    await loadQuestions(user.id)
    setPosting(false)
  }

  async function handleDeleteQuestion(questionId) {
    const { error: deleteError } = await supabase
      .from('questions').delete().eq('id', questionId)
    if (deleteError) { setError('Delete failed: ' + deleteError.message); return }
    setMyQuestion(null)
    setQuestions(prev => prev.filter(q => q.id !== questionId))
  }

  async function handleAnswer(questionId) {
    const answer = answerText[questionId]
    if (!answer?.trim() || !user) return

    const { error: updateError } = await supabase
      .from('questions')
      .update({ answer: answer.trim(), answered_by: user.id })
      .eq('id', questionId)

    if (updateError) { setError('Answer failed: ' + updateError.message); return }

    await loadQuestions(user.id)
    setAnswerText(prev => ({ ...prev, [questionId]: '' }))
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1B14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#52B788', fontFamily: "'Lato', sans-serif" }}>Loading...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B14', maxWidth: 430, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ background: '#122018', borderBottom: '1px solid #2D6A4F33', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 10 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', margin: 0, fontSize: 18, fontWeight: 800 }}>Ask the Committee</h2>
        <p style={{ fontFamily: "'Lato', sans-serif", color: '#52B788', margin: '2px 0 0', fontSize: 12 }}>
          {user.is_committee ? 'Answer community questions' : 'One question per day'}
        </p>
      </div>

      <div style={{ padding: '16px 20px', paddingBottom: 100 }}>

        {/* Error banner */}
        {error && (
          <div style={{ background: '#3B0A0A', border: '1px solid #ff6b6b44', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
            <p style={{ color: '#ff6b6b', fontFamily: "'Lato', sans-serif", fontSize: 13, margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Ask box — members only */}
        {!user.is_committee && (
          <div style={{ marginBottom: 28 }}>
            {myQuestion ? (
              <div style={{ background: '#122018', border: '2px solid #52B78855', borderRadius: 16, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: '#52B788', fontWeight: 800, letterSpacing: 1.2, margin: 0 }}>YOUR QUESTION TODAY</p>
                  <button onClick={() => handleDeleteQuestion(myQuestion.id)}
                    style={{ background: 'none', border: '1px solid #ff6b6b44', borderRadius: 6, padding: '4px 10px', color: '#ff6b6b', fontFamily: "'Lato', sans-serif", fontSize: 11, cursor: 'pointer' }}>
                    Delete
                  </button>
                </div>
                <p style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontSize: 15, fontWeight: 700, margin: '0 0 14px', lineHeight: 1.5 }}>{myQuestion.question}</p>
                {myQuestion.answer ? (
                  <div style={{ background: '#0D1B14', borderRadius: 12, padding: 14, borderLeft: '3px solid #52B788' }}>
                    <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: '#52B788', fontWeight: 800, letterSpacing: 1, margin: '0 0 8px' }}>✅ COMMITTEE ANSWERED</p>
                    <p style={{ fontFamily: "'Lato', sans-serif", color: '#C8E6C9', fontSize: 14, margin: 0, lineHeight: 1.7 }}>{myQuestion.answer}</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#52B788' }} />
                    <p style={{ fontFamily: "'Lato', sans-serif", color: '#52B788', fontSize: 12, margin: 0 }}>Waiting for committee response...</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: '#122018', border: '1px solid #2D6A4F44', borderRadius: 16, padding: 18 }}>
                <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: '#52B788', fontWeight: 800, letterSpacing: 1.2, margin: '0 0 12px' }}>ASK A QUESTION</p>
                <textarea
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value.slice(0, 500))}
                  placeholder="What would you like to ask the committee?"
                  style={{ width: '100%', background: '#0D1B14', border: '1px solid #2D6A4F55', borderRadius: 10, padding: '12px', color: '#E8F5E9', fontFamily: "'Lato', sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box', minHeight: 90, resize: 'none', marginBottom: 4, lineHeight: 1.6 }}
                />
                <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: newQuestion.length >= 480 ? '#ff6b6b' : '#2D6A4F', margin: '0 0 12px' }}>{newQuestion.length}/500</p>
                <button
                  onClick={handlePostQuestion}
                  disabled={posting || !newQuestion.trim()}
                  style={{ width: '100%', background: newQuestion.trim() && !posting ? 'linear-gradient(135deg,#2D6A4F,#52B788)' : '#1e3028', border: 'none', borderRadius: 10, padding: '13px', color: '#fff', fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, cursor: newQuestion.trim() && !posting ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
                  {posting ? 'Posting...' : 'Post Question →'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Questions list */}
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: '#52B788', fontWeight: 800, letterSpacing: 1.5, margin: '0 0 14px' }}>
          {user.is_committee ? `ALL QUESTIONS (${questions.length})` : `COMMUNITY QUESTIONS (${questions.length})`}
        </p>

        {questions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: 32, margin: '0 0 10px' }}>🌿</p>
            <p style={{ fontFamily: "'Sora', sans-serif", color: '#2D6A4F', fontSize: 14, fontWeight: 700, margin: 0 }}>No questions yet</p>
            <p style={{ fontFamily: "'Lato', sans-serif", color: '#1B4332', fontSize: 12, margin: '4px 0 0' }}>Be the first to ask</p>
          </div>
        )}

        {questions.map(q => (
          <div key={q.id} style={{ background: '#122018', border: '1px solid #2D6A4F22', borderRadius: 16, padding: 16, marginBottom: 14, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2D6A4F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 11, color: '#fff', flexShrink: 0 }}>
                  {q.users?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, color: '#E8F5E9', fontWeight: 700, margin: 0 }}>{q.users?.name || 'Member'}</p>
              </div>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: '#2D6A4F', margin: 0 }}>
                {q.created_at ? new Date(q.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) : ''}
              </p>
            </div>

            <p style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontSize: 14, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.5 }}>{q.question}</p>

            {q.answer ? (
              <div style={{ background: '#0D1B14', borderRadius: 10, padding: 12, borderLeft: '3px solid #52B788' }}>
                <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: '#52B788', fontWeight: 800, letterSpacing: 1, margin: '0 0 6px' }}>✅ COMMITTEE</p>
                <p style={{ fontFamily: "'Lato', sans-serif", color: '#C8E6C9', fontSize: 13, margin: 0, lineHeight: 1.7 }}>{q.answer}</p>
              </div>
            ) : user.is_committee ? (
              <div style={{ background: '#0D1B14', borderRadius: 10, padding: 12 }}>
                <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: '#95C9A0', fontWeight: 800, letterSpacing: 1, margin: '0 0 8px' }}>YOUR ANSWER</p>
                <textarea
                  value={answerText[q.id] || ''}
                  onChange={e => setAnswerText(prev => ({ ...prev, [q.id]: e.target.value }))}
                  placeholder="Type your answer..."
                  style={{ width: '100%', background: '#122018', border: '1px solid #2D6A4F44', borderRadius: 8, padding: '10px', color: '#E8F5E9', fontFamily: "'Lato', sans-serif", fontSize: 13, outline: 'none', boxSizing: 'border-box', minHeight: 60, resize: 'none', marginBottom: 8, lineHeight: 1.6 }}
                />
                <button
                  onClick={() => handleAnswer(q.id)}
                  disabled={!answerText[q.id]?.trim()}
                  style={{ width: '100%', background: answerText[q.id]?.trim() ? '#52B788' : '#1e3028', border: 'none', borderRadius: 8, padding: '10px', color: '#fff', fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 13, cursor: answerText[q.id]?.trim() ? 'pointer' : 'not-allowed' }}>
                  Submit Answer
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2D6A4F' }} />
                <p style={{ fontFamily: "'Lato', sans-serif", color: '#2D6A4F', fontSize: 12, margin: 0 }}>Awaiting answer...</p>
              </div>
            )}

            {user.is_committee && (
              <button onClick={() => handleDeleteQuestion(q.id)}
                style={{ background: 'none', border: 'none', color: '#ff6b6b44', fontFamily: "'Lato', sans-serif", fontSize: 11, cursor: 'pointer', marginTop: 10, padding: 0 }}>
                🗑 Delete question
              </button>
            )}
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
                   }
          
