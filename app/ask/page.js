'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AskPage() {
  const [user, setUser] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadQuestions() {
    const { data } = await supabase
      .from('questions')
      .select('*, users(name)')
      .order('created_at', { ascending: false })

    setQuestions(data || [])
  }

  useEffect(() => {
    const userData = localStorage.getItem('kiruare_user')

    if (userData) {
      setUser(JSON.parse(userData))
    }

    loadQuestions()
  }, [])

  async function sendQuestion() {
    if (!text.trim() || !user) return

    setLoading(true)
    setError('')

    const { error } = await supabase
      .from('questions')
      .insert([
        {
          user_id: user.id,
          question: text.trim()
        }
      ])

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setText('')
    loadQuestions()
    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>Community Questions</h2>
      </div>

      <div style={styles.askBox}>
        <textarea
          placeholder="Ask something..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={styles.textarea}
        />

        {error && (
          <p style={styles.error}>
            {error}
          </p>
        )}

        <button
          onClick={sendQuestion}
          disabled={loading}
          style={styles.button}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <div>
        {questions.map((q) => (
          <div key={q.id} style={styles.card}>
            <div style={styles.top}>
              <div style={styles.avatar}>
                {q.users?.name?.[0] || '?'}
              </div>

              <div>
                <p style={styles.name}>
                  {q.users?.name || 'Member'}
                </p>

                <p style={styles.question}>
                  {q.question}
                </p>

                {q.answer && (
                  <div style={styles.answerBox}>
                    <p style={styles.answer}>
                      {q.answer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: any = {
  page: {
    minHeight: '100vh',
    background: '#e5ddd5',
    padding: '12px',
    fontFamily: 'sans-serif',
    maxWidth: '430px',
    margin: '0 auto'
  },

  header: {
    marginBottom: '15px'
  },

  title: {
    fontSize: '20px',
    color: '#075e54'
  },

  askBox: {
    background: '#dcf8c6',
    padding: '12px',
    borderRadius: '14px',
    marginBottom: '15px'
  },

  textarea: {
    width: '100%',
    minHeight: '70px',
    border: 'none',
    outline: 'none',
    resize: 'none',
    borderRadius: '10px',
    padding: '10px',
    fontSize: '14px',
    marginBottom: '10px'
  },

  button: {
    width: '100%',
    background: '#25d366',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '10px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },

  error: {
    color: 'red',
    fontSize: '12px',
    marginBottom: '8px'
  },

  card: {
    background: '#fff',
    padding: '12px',
    borderRadius: '14px',
    marginBottom: '10px'
  },

  top: {
    display: 'flex',
    gap: '10px'
  },

  avatar: {
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    background: '#25d366',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  },

  name: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#075e54',
    marginBottom: '4px'
  },

  question: {
    fontSize: '14px',
    color: '#111'
  },

  answerBox: {
    background: '#f0f0f0',
    padding: '8px',
    borderRadius: '8px',
    marginTop: '8px'
  },

  answer: {
    fontSize: '13px',
    color: '#333'
  }
}
