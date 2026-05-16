'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import BottomNav from '../components/BottomNav'

function Avatar({ name, size = 40 }) {
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

export default function ChatPage() {
  const [user, setUser] = useState(null)
  const [groupMessages, setGroupMessages] = useState([])
  const [contactList, setContactList] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [dmMessages, setDmMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      try {
        const userId = localStorage.getItem('kiruare_user_id')
        if (userId) {
          const { data } = await supabase.from('users').select('*').eq('id', userId).single()
          setUser(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (!user) return

    async function fetchGroupMessages() {
      try {
        const table = user.is_committee ? 'announcements' : 'member_announcements'
        const { data } = await supabase
          .from(table)
          .select('*, users(id, name)')
          .order('created_at', { ascending: false })
          .limit(50)
        setGroupMessages(data || [])
      } catch (err) {
        console.error(err)
      }
    }

    async function fetchContacts() {
      try {
        const { data } = await supabase
          .from('users')
          .select('*')
          .neq('id', user.id)
        if (user.is_committee) {
          setContactList(data.filter(u => u.is_committee) || [])
        } else {
          setContactList(data.filter(u => !u.is_committee) || [])
        }
      } catch (err) {
        console.error(err)
      }
    }

    fetchGroupMessages()
    fetchContacts()
  }, [user])

  useEffect(() => {
    if (!selectedContact || !user) return

    async function fetchDMs() {
      try {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true })
        setDmMessages(data || [])
      } catch (err) {
        console.error(err)
      }
    }

    fetchDMs()
  }, [selectedContact, user])

  async function sendGroupMessage() {
    if (!newMessage.trim() || !user) return
    setSending(true)
    try {
      const table = user.is_committee ? 'announcements' : 'member_announcements'
      const { error } = await supabase.from(table).insert({
        author_id: user.id,
        content: newMessage
      })
      if (error) throw error
      setNewMessage('')
      const { data } = await supabase
        .from(table)
        .select('*, users(id, name)')
        .order('created_at', { ascending: false })
        .limit(50)
      setGroupMessages(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  async function sendDM() {
    if (!newMessage.trim() || !user || !selectedContact) return
    setSending(true)
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: selectedContact.id,
        content: newMessage
      })
      if (error) throw error
      setNewMessage('')
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })
      setDmMessages(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
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

  // DM View
  if (selectedContact) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1B14', maxWidth: 430, margin: '0 auto' }}>
        <div style={{ background: '#122018', borderBottom: '1px solid #2D6A4F33', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setSelectedContact(null)} style={{ background: 'none', border: 'none', color: '#52B788', cursor: 'pointer', fontSize: 20 }}>←</button>
          <div>
            <p style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', margin: 0, fontWeight: 700 }}>{selectedContact.name}</p>
            <p style={{ fontFamily: "'Lato', sans-serif", color: '#52B788', margin: '2px 0 0', fontSize: 11 }}>{selectedContact.residence}</p>
          </div>
        </div>

        <div style={{ padding: '16px 20px', paddingBottom: 140, height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          {dmMessages.map(msg => (
            <div key={msg.id} style={{
              display: 'flex',
              justifyContent: msg.sender_id === user.id ? 'flex-end' : 'flex-start',
              marginBottom: 12
            }}>
              <div style={{
                background: msg.sender_id === user.id ? '#52B788' : '#122018',
                border: msg.sender_id === user.id ? 'none' : '1px solid #2D6A4F33',
                borderRadius: 12,
                padding: '10px 14px',
                maxWidth: '80%'
              }}>
                <p style={{
                  fontFamily: "'Lato', sans-serif",
                  color: msg.sender_id === user.id ? '#0D1B14' : '#E8F5E9',
                  fontSize: 14,
                  margin: 0,
                  lineHeight: 1.5
                }}>
                  {msg.content}
                </p>
                <p style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: 10,
                  color: msg.sender_id === user.id ? 'rgba(0,0,0,0.6)' : '#52B788',
                  margin: '4px 0 0'
                }}>
                  {new Date(msg.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: 'fixed', bottom: 70, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: '#122018', borderTop: '1px solid #2D6A4F33', padding: '12px 20px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Message..."
              style={{
                flex: 1, background: '#0D1B14', border: '1px solid #2D6A4F55', borderRadius: 10, padding: '10px 14px',
                color: '#E8F5E9', fontFamily: "'Lato', sans-serif", fontSize: 14, outline: 'none'
              }}
              onKeyPress={e => e.key === 'Enter' && sendDM()}
            />
            <button
              onClick={sendDM}
              disabled={!newMessage.trim() || sending}
              style={{
                background: newMessage.trim() ? '#52B788' : '#1e3028', border: 'none', borderRadius: 10, padding: '10px 16px',
                color: '#fff', fontFamily: "'Sora', sans-serif", fontWeight: 700, cursor: newMessage.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main Chat View
  return (
    <div style={{ minHeight: '100vh', background: '#0D1B14', maxWidth: 430, margin: '0 auto' }}>
      <div style={{ background: '#122018', borderBottom: '1px solid #2D6A4F33', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 10 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', margin: 0, fontSize: 18, fontWeight: 800 }}>Messages</h2>
      </div>

      <div style={{ padding: '16px 20px', paddingBottom: 100 }}>
        {/* Group Chat Section */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: '#52B788', fontWeight: 700, letterSpacing: 1.2, margin: '0 0 12px' }}>
            {user.is_committee ? '👮 ADMIN GROUP' : '👥 MEMBER GROUP'}
          </p>

          <div style={{ background: '#122018', border: '1px solid #2D6A4F33', borderRadius: 14, padding: 14, marginBottom: 16 }}>
            <textarea
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Post a message..."
              style={{
                width: '100%', background: '#0D1B14', border: '1px solid #2D6A4F55', borderRadius: 10, padding: '10px',
                color: '#E8F5E9', fontFamily: "'Lato', sans-serif", fontSize: 13, outline: 'none', boxSizing: 'border-box',
                minHeight: 60, resize: 'none', marginBottom: 8
              }}
            />
            <button
              onClick={sendGroupMessage}
              disabled={!newMessage.trim() || sending}
              style={{
                width: '100%', background: newMessage.trim() ? '#52B788' : '#1e3028', border: 'none', borderRadius: 10,
                padding: '10px', color: '#fff', fontFamily: "'Sora', sans-serif", fontWeight: 700, cursor: newMessage.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>

          <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 24 }}>
            {groupMessages.slice(0, 5).map(msg => (
              <div key={msg.id} style={{ background: '#122018', border: '1px solid #2D6A4F33', borderRadius: 10, padding: 10, marginBottom: 8 }}>
                <p style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontSize: 12, fontWeight: 700, margin: '0 0 4px' }}>{msg.users?.name}</p>
                <p style={{ fontFamily: "'Lato', sans-serif", color: '#C8E6C9', fontSize: 12, margin: 0 }}>{msg.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Direct Messages Section */}
        <div>
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: '#52B788', fontWeight: 700, letterSpacing: 1.2, margin: '0 0 12px' }}>DIRECT MESSAGES</p>
          {contactList.length > 0 ? (
            contactList.map(contact => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                style={{
                  width: '100%', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                  borderBottom: '1px solid #2D6A4F22', cursor: 'pointer', textAlign: 'left'
                }}
              >
                <Avatar name={contact.name} size={40} />
                <div>
                  <p style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontSize: 14, fontWeight: 700, margin: 0 }}>{contact.name}</p>
                  <p style={{ fontFamily: "'Lato', sans-serif", color: '#52B788', fontSize: 11, margin: '2px 0 0' }}>{contact.residence}</p>
                </div>
              </button>
            ))
          ) : (
            <p style={{ fontFamily: "'Lato', sans-serif", color: '#2D6A4F', fontSize: 13, textAlign: 'center', paddingTop: 20 }}>No contacts available</p>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
    }
