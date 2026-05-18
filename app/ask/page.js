'use client'
import { useEffect, useState } from 'react'
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

  useEffect(() => {
    async function init() {
      const userId = localStorage.getItem('kiruare_user_id')
      if (!userId) { router.push('/signup'); return }
      const { data: userData } = await supabase.from('users').select('*').eq('id', userId).single()
      if (!userData) { router.push('/signup'); return }
      setUser(userData)

      const { data: allQuestions } = await supabase
        .from('questions')
        .select('*, users(name)')
        .order('created_at', { ascending: false })
      setQuestions(allQuestions || [])

      if (!userData.is_committee) {
        const today = new Date().toISOString().split('T')[0]
        const mine = (allQuestions || []).find(q =>
          q.user_id === userId && q.created_at.startsWith(today)
        )
        setMyQuestion(mine || null)
      }

      setLoading(false)
    }
    init()
  }, [])

  async function handlePostQuestion() {
    if (!newQuestion.trim()) return
    setPosting(true)
    try {
      const { data, error } = await supabase
        .from('questions')
        .insert({ user_id: user.id, question: newQuestion.trim() })
        .select('*, users(name)')
        .single()
      if (error) throw error
      setMyQuestion(data)
      setQuestions(prev => [data, ...prev])
      setNewQuestion('')
    } catch (err) {
      console.error(err)
    } finally {
      setPosting(false)
    }
  }

  async function handleDeleteQuestion(questionId) {
    try {
      await supabase.from('questions').delete().eq('id', questionId)
      setMyQuestion(null)
      setQuestions(prev => prev.filter(q => q.id !== questionId))
    } catch (err) {
      console.error(err)
    }
  }

  async function handleAnswer(questionId) {
    const answer = answerText[questionId]
    if (!answer?.trim()) return
    try {
      const { data } = await supabase
        .from('questions')
        .update({ answer: answer.trim(), answered_by: user.id })
        .eq('id', questionId)
        .select('*, users(name)')
        .single()
      setQuestions(prev => prev.map(q => q.id === questionId ? data : q))
      setAnswerText(prev => ({ ...prev, [questionId]: '' }))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1B14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#52B788', fontFamily: "'Lato', sans-serif" }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B14', maxWidth: 430, margin: '0 auto' }}>
      <div style={{ background: '#122018', borderBottom: '1px solid #2D6A4F33', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 10 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', margin: 0, fontSize: 18, fontWeight: 800 }}>Ask the Committee</h2>
        <p style={{ fontFamily: "'Lato', sans-serif", color: '#52B788', margin: '2px 0 0', fontSize: 12 }}>One question per day</p>
      </div>

      <div style={{ padding: '16px 20px', paddingBottom: 100 }}>

        {!user.is_committee && (
          <div style={{ marginBottom: 24 }}>
            {myQuestion ? (
              <div style={{ background: '#122018', border: '2px solid #52B78844', borderRadius: 14, padding: 16 }}>
                <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: '#52B788', fontWeight: 700, letterSpacing: 1, margin: '0 0 8px' }}>YOUR QUESTION TODAY</p>
                <p style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>{myQuestion.question}</p>
                {myQuestion.answer ? (
                  <div style={{ background: '#0D1B14', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                    <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: '#52B788', fontWeight: 700, margin: '0 0 6px' }}>ANSWER</p>
                    <p style={{ fontFamily: "'Lato', sans-serif", color: '#C8E6C9', fontSize: 13, margin: 0 }}>{myQuestion.answer}</p>
                  </div>
                ) : (
                  <p style={{ fontFamily: "'Lato', sans-serif", color: '#2D6A4F', fontSize: 12, margin: '0 0 12px' }}>Waiting for an admin to answer...</p>
                )}
                <button onClick={() => handleDeleteQuestion(myQuestion.id)}
                  style={{ background: 'none', border: '1px solid #ff6b6b44', borderRadius: 8, padding: '8px 14px', color: '#ff6b6b', fontFamily: "'Lato', sans-serif", fontSize: 12, cursor: 'pointer' }}>
                  Delete & Ask New Question
                </button>
              </div>
            ) : (
              <div style={{ background: '#122018', border: '1px solid #2D6A4F33', borderRadius: 14, padding: 16 }}>
                <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: '#52B788', fontWeight: 700, letterSpacing: 1, margin: '0 0 10px' }}>ASK A QUESTION</p>
                <textarea value={newQuestion} onChange={e => setNewQuestion(e.target.value)} placeholder="Type your question here..."
                  style={{ width: '100%', background: '#0D1B14', border: '1px solid #2D6A4F55', borderRadius: 10, padding: '10px', color: '#E8F5E9', fontFamily: "'Lato', sans-serif", fontSize: 13, outline: 'none', boxSizing: 'border-box', minHeight: 80, resize: 'none', marginBottom: 10 }} />
                <button onClick={handlePostQuestion} disabled={posting || !newQuestion.trim()}
                  style={{ width: '100%', background: newQuestion.trim() ? 'linear-gradient(135deg,#2D6A4F,#52B788)' : '#1e3028', border: 'none', borderRadius: 10, padding: '12px', color: '#fff', fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, cursor: newQuestion.trim() ? 'pointer' : 'not-allowed' }}>
                  {posting ? 'Posting...' : 'Post Question'}
                </button>
              </div>
            )}
          </div>
        )}

        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: '#52B788', fontWeight: 700, letterSpacing: 1.2, margin: '0 0 12px' }}>
          {user.is_committee ? 'ALL QUESTIONS' : 'COMMUNITY QUESTIONS'}
        </p>

        {questions.length === 0 && (
          <p style={{ fontFamily: "'Lato', sans-serif", color: '#2D6A4F', fontSize: 13, textAlign: 'center', marginTop: 40 }}>No questions yet</p>
        )}

        {questions.map(q => (
          <div key={q.id} style={{ background: '#122018', border: '1px solid #2D6A4F33', borderRadius: 14, padding: 16, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: '#52B788', fontWeight: 700, margin: 0 }}>{q.users?.name}</p>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: '#2D6A4F', margin: 0 }}>{new Date(q.created_at).toLocaleDateString()}</p>
            </div>

            <p style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontSize: 14, fontWeight: 700, margin: '0 0 10px' }}>{q.question}</p>

            {q.answer ? (
              <div style={{ background: '#0D1B14', borderRadius: 10, padding: 12 }}>
                <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: '#52B788', fontWeight: 700, margin: '0 0 6px', letterSpacing: 1 }}>ANSWERED BY COMMITTEE</p>
                <p style={{ fontFamily: "'Lato', sans-serif", color: '#C8E6C9', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{q.answer}</p>
              </div>
            ) : user.is_committee ? (
              <div>
                <textarea
                  value={answerText[q.id] || ''}
                  onChange={e => setAnswerText(prev => ({ ...prev, [q.id]: e.target.value }))}
                  placeholder="Type your answer..."
                  style={{ width: '100%', background: '#0D1B14', border: '1px solid #2D6A4F55', borderRadius: 10, padding: '10px', color: '#E8F5E9', fontFamily: "'Lato', sans-serif", fontSize: 13, outline: 'none', boxSizing: 'border-box', minHeight: 60, resize: 'none', marginBottom: 8 }}
                />
                <button onClick={() => handleAnswer(q.id)} disabled={!answerText[q.id]?.trim()}
                  style={{ width: '100%', background: answerText[q.id]?.trim() ? '#52B788' : '#1e3028', border: 'none', borderRadius: 10, padding: '10px', color: '#fff', fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 13, cursor: answerText[q.id]?.trim() ? 'pointer' : 'not-allowed' }}>
                  Submit Answer
                </button>
              </div>
            ) : (
              <p style={{ fontFamily: "'Lato', sans-serif", color: '#2D6A4F', fontSize: 12, margin: 0 }}>Awaiting answer...</p>
            )}

            {user.is_committee && (
              <button onClick={() => handleDeleteQuestion(q.id)}
                style={{ background: 'none', border: 'none', color: '#ff6b6b55', fontFamily: "'Lato', sans-serif", fontSize: 11, cursor: 'pointer', marginTop: 8, padding: 0 }}>
                Delete question
              </button>
            )}
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
                  }
