'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import BottomNav from '../components/BottomNav'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .ask-root {
    min-height: 100vh;
    background: #F7F5F2;
    max-width: 430px;
    margin: 0 auto;
    font-family: 'DM Sans', sans-serif;
  }

  .ask-header {
    padding: 28px 24px 20px;
    border-bottom: 1px solid #E8E4DF;
    position: sticky;
    top: 0;
    background: #F7F5F2;
    z-index: 10;
  }

  .ask-header-eyebrow {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 2px;
    color: #A09890;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .ask-header-title {
    font-family: 'DM Serif Display', serif;
    font-size: 26px;
    color: #1A1714;
    line-height: 1.1;
  }

  .ask-header-title em {
    font-style: italic;
    color: #7C6F5B;
  }

  .ask-body {
    padding: 24px 24px 100px;
  }

  /* Ask box */
  .ask-box {
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 32px;
    border: 1px solid #EAE6E1;
  }

  .ask-box-label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #A09890;
    margin-bottom: 14px;
  }

  .ask-textarea {
    width: 100%;
    background: #F7F5F2;
    border: 1px solid #EAE6E1;
    border-radius: 10px;
    padding: 14px;
    color: #1A1714;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 300;
    outline: none;
    resize: none;
    min-height: 90px;
    line-height: 1.7;
    transition: border-color 0.2s;
  }

  .ask-textarea:focus {
    border-color: #B5A898;
  }

  .ask-textarea::placeholder {
    color: #C4BCB4;
  }

  .ask-char-count {
    font-size: 11px;
    color: #C4BCB4;
    text-align: right;
    margin: 6px 0 14px;
  }

  .ask-error {
    font-size: 12px;
    color: #C0392B;
    margin-bottom: 10px;
  }

  .ask-btn {
    width: 100%;
    background: #1A1714;
    border: none;
    border-radius: 10px;
    padding: 14px;
    color: #F7F5F2;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
    letter-spacing: 0.3px;
  }

  .ask-btn:disabled {
    background: #E8E4DF;
    color: #C4BCB4;
    cursor: not-allowed;
  }

  .ask-btn:not(:disabled):active {
    transform: scale(0.99);
  }

  /* My question card */
  .my-q-card {
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 32px;
    border: 1px solid #EAE6E1;
  }

  .my-q-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .my-q-label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #A09890;
  }

  .delete-btn {
    background: none;
    border: 1px solid #F0E0DF;
    border-radius: 6px;
    padding: 4px 10px;
    color: #C0392B;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
  }

  .delete-btn:hover { opacity: 1; }

  .my-q-text {
    font-family: 'DM Serif Display', serif;
    font-size: 16px;
    color: #1A1714;
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .answer-block {
    background: #F7F5F2;
    border-radius: 10px;
    padding: 14px 16px;
    border-left: 2px solid #B5A898;
  }

  .answer-label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #A09890;
    margin-bottom: 8px;
  }

  .answer-text {
    font-size: 14px;
    color: #3D3530;
    line-height: 1.7;
    font-weight: 300;
  }

  .waiting-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .waiting-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #C4BCB4;
    animation: blink 2s ease-in-out infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }

  .waiting-text {
    font-size: 12px;
    color: #A09890;
    font-weight: 300;
  }

  /* Section label */
  .section-label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #A09890;
    margin-bottom: 16px;
  }

  /* Question cards */
  .q-card {
    background: #fff;
    border-radius: 16px;
    padding: 18px 20px;
    margin-bottom: 12px;
    border: 1px solid #EAE6E1;
    transition: border-color 0.2s;
  }

  .q-card:hover { border-color: #D4CEC8; }

  .q-card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .q-avatar-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .q-avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #EAE6E1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Serif Display', serif;
    font-size: 11px;
    color: #7C6F5B;
  }

  .q-name {
    font-size: 13px;
    font-weight: 500;
    color: #3D3530;
  }

  .q-date {
    font-size: 11px;
    color: #C4BCB4;
    font-weight: 300;
  }

  .q-text {
    font-family: 'DM Serif Display', serif;
    font-size: 15px;
    color: #1A1714;
    line-height: 1.55;
    margin-bottom: 14px;
  }

  /* Committee answer input */
  .committee-answer-box {
    background: #F7F5F2;
    border-radius: 10px;
    padding: 14px;
  }

  .committee-answer-label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #A09890;
    margin-bottom: 10px;
  }

  .committee-textarea {
    width: 100%;
    background: #fff;
    border: 1px solid #EAE6E1;
    border-radius: 8px;
    padding: 12px;
    color: #1A1714;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 300;
    outline: none;
    resize: none;
    min-height: 60px;
    line-height: 1.6;
    margin-bottom: 10px;
    transition: border-color 0.2s;
  }

  .committee-textarea:focus { border-color: #B5A898; }
  .committee-textarea::placeholder { color: #C4BCB4; }

  .submit-btn {
    width: 100%;
    background: #1A1714;
    border: none;
    border-radius: 8px;
    padding: 11px;
    color: #F7F5F2;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .submit-btn:disabled {
    background: #E8E4DF;
    color: #C4BCB4;
    cursor: not-allowed;
  }

  .admin-delete {
    background: none;
    border: none;
    color: #D4CEC8;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    cursor: pointer;
    margin-top: 12px;
    padding: 0;
    transition: color 0.2s;
  }

  .admin-delete:hover { color: #C0392B; }

  /* Divider */
  .q-divider {
    height: 1px;
    background: #EAE6E1;
    margin: 14px 0;
  }

  /* Empty state */
  .empty-state {
    text-align: center;
    padding: 48px 20px;
  }

  .empty-icon {
    font-size: 28px;
    margin-bottom: 12px;
  }

  .empty-title {
    font-family: 'DM Serif Display', serif;
    font-size: 18px;
    color: #3D3530;
    margin-bottom: 6px;
  }

  .empty-sub {
    font-size: 13px;
    color: #C4BCB4;
    font-weight: 300;
  }

  /* Loading */
  .loading-screen {
    min-height: 100vh;
    background: #F7F5F2;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading-text {
    font-family: 'DM Serif Display', serif;
    font-style: italic;
    color: #A09890;
    font-size: 16px;
  }
`

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

  async function loadQuestions(userId) {
    const { data, error: fetchError } = await supabase
      .from('questions')
      .select('id, question, answer, user_id, answered_by, created_at, users(name)')
      .order('created_at', { ascending: false })
    if (fetchError) { console.error('Failed to load questions:', fetchError.message); return }
    const list = data || []
    setQuestions(list)
    if (userId) {
      const today = new Date().toISOString().split('T')[0]
      const mine = list.find(q => q.user_id === userId && q.created_at.slice(0, 10) === today)
      setMyQuestion(mine || null)
    }
  }

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
  }, [])

  async function handlePostQuestion() {
    if (!newQuestion.trim() || !user) return
    setPosting(true)
    setError('')
    const { error: insertError } = await supabase
      .from('questions')
      .insert([{ user_id: user.id, question: newQuestion.trim() }])
    if (insertError) {
      setError(insertError.message)
      setPosting(false)
      return
    }
    setNewQuestion('')
    await loadQuestions(user.id)
    setPosting(false)
  }

  async function handleDeleteQuestion(questionId) {
    await supabase.from('questions').delete().eq('id', questionId)
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
    if (updateError) { console.error(updateError); return }
    await loadQuestions(user?.id)
    setAnswerText(prev => ({ ...prev, [questionId]: '' }))
  }

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-screen">
          <p className="loading-text">Loading...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{styles}</style>
      <div className="ask-root">

        {/* Header */}
        <div className="ask-header">
          <p className="ask-header-eyebrow">Community</p>
          <h1 className="ask-header-title">
            Ask the <em>Committee</em>
          </h1>
        </div>

        <div className="ask-body">

          {/* Ask box — members only */}
          {!user.is_committee && (
            <>
              {myQuestion ? (
                <div className="my-q-card">
                  <div className="my-q-top">
                    <span className="my-q-label">Your question</span>
                    <button className="delete-btn" onClick={() => handleDeleteQuestion(myQuestion.id)}>Remove</button>
                  </div>
                  <p className="my-q-text">{myQuestion.question}</p>
                  {myQuestion.answer ? (
                    <div className="answer-block">
                      <p className="answer-label">Committee replied</p>
                      <p className="answer-text">{myQuestion.answer}</p>
                    </div>
                  ) : (
                    <div className="waiting-row">
                      <div className="waiting-dot" />
                      <p className="waiting-text">Awaiting a response</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="ask-box">
                  <p className="ask-box-label">Ask a question</p>
                  <textarea
                    className="ask-textarea"
                    value={newQuestion}
                    onChange={e => setNewQuestion(e.target.value)}
                    placeholder="What's on your mind?"
                    maxLength={500}
                  />
                  <p className="ask-char-count">{newQuestion.length} / 500</p>
                  {error && <p className="ask-error">{error}</p>}
                  <button
                    className="ask-btn"
                    onClick={handlePostQuestion}
                    disabled={posting || !newQuestion.trim()}
                  >
                    {posting ? 'Posting...' : 'Submit question'}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Section label */}
          <p className="section-label">
            {user.is_committee
              ? `All questions · ${questions.length}`
              : `From the community · ${questions.length}`}
          </p>

          {/* Empty state */}
          {questions.length === 0 && (
            <div className="empty-state">
              <p className="empty-icon">✦</p>
              <p className="empty-title">Nothing yet</p>
              <p className="empty-sub">Be the first to ask something</p>
            </div>
          )}

          {/* Questions */}
          {questions.map(q => (
            <div className="q-card" key={q.id}>
              <div className="q-card-top">
                <div className="q-avatar-row">
                  <div className="q-avatar">{q.users?.name?.[0]?.toUpperCase() || '?'}</div>
                  <span className="q-name">{q.users?.name || 'Member'}</span>
                </div>
                <span className="q-date">
                  {new Date(q.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                </span>
              </div>

              <p className="q-text">{q.question}</p>

              {q.answer ? (
                <div className="answer-block">
                  <p className="answer-label">Committee</p>
                  <p className="answer-text">{q.answer}</p>
                </div>
              ) : user.is_committee ? (
                <div className="committee-answer-box">
                  <p className="committee-answer-label">Your answer</p>
                  <textarea
                    className="committee-textarea"
                    value={answerText[q.id] || ''}
                    onChange={e => setAnswerText(prev => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="Write a response..."
                  />
                  <button
                    className="submit-btn"
                    onClick={() => handleAnswer(q.id)}
                    disabled={!answerText[q.id]?.trim()}
                  >
                    Post answer
                  </button>
                </div>
              ) : (
                <div className="waiting-row">
                  <div className="waiting-dot" />
                  <p className="waiting-text">Awaiting answer</p>
                </div>
              )}

              {user.is_committee && (
                <button className="admin-delete" onClick={() => handleDeleteQuestion(q.id)}>
                  Delete question
                </button>
              )}
            </div>
          ))}
        </div>

        <BottomNav />
      </div>
    </>
  )
                }
                      
