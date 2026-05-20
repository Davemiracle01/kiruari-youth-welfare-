'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import BottomNav from '../components/BottomNav'

/* ─── Avatar ────────────────────────────────────────────────── */
function Avatar({ name, size = 40, online = false }) {
  if (!name) return null
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const palette = ['#2D6A4F', '#1B4332', '#40916C', '#095D7E', '#1A6B8A', '#386641']
  const bg = palette[name.charCodeAt(0) % palette.length]
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%', background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Sora', sans-serif", fontWeight: 700,
        fontSize: size * 0.36, color: '#fff',
        boxShadow: `0 0 0 2px #0D1B14, 0 2px 8px rgba(0,0,0,0.4)`
      }}>
        {initials}
      </div>
      {online && (
        <span style={{
          position: 'absolute', bottom: 1, right: 1,
          width: size * 0.27, height: size * 0.27,
          background: '#52B788', borderRadius: '50%',
          border: '2px solid #0D1B14'
        }} />
      )}
    </div>
  )
}

/* ─── Timestamp ─────────────────────────────────────────────── */
function TimeLabel({ ts }) {
  const d = new Date(ts)
  return (
    <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, opacity: 0.55 }}>
      {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  )
}

/* ─── Helpers ────────────────────────────────────────────────── */
function scrollToBottom(ref) {
  if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
}

/* ─── Styles ─────────────────────────────────────────────────── */
const S = {
  root: { minHeight: '100vh', background: '#0D1B14', maxWidth: 430, margin: '0 auto', display: 'flex', flexDirection: 'column', position: 'relative' },
  header: { background: '#0f1f17', borderBottom: '1px solid rgba(45,106,79,0.25)', padding: '14px 18px', position: 'sticky', top: 0, zIndex: 20, backdropFilter: 'blur(12px)' },
  headerRow: { display: 'flex', alignItems: 'center', gap: 10 },
  backBtn: { background: 'none', border: 'none', color: '#52B788', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: '0 4px 0 0', display: 'flex', alignItems: 'center' },
  sectionLabel: { fontFamily: "'Lato', sans-serif", fontSize: 10, color: '#52B788', fontWeight: 700, letterSpacing: 1.4, margin: '0 0 10px', textTransform: 'uppercase' },
  contactBtn: { width: '100%', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid rgba(45,106,79,0.15)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' },
  contactName: { fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontSize: 14, fontWeight: 700, margin: 0 },
  contactSub: { fontFamily: "'Lato', sans-serif", color: '#52B788', fontSize: 11, margin: '2px 0 0' },
  inputBar: { position: 'fixed', bottom: 62, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: '#0f1f17', borderTop: '1px solid rgba(45,106,79,0.25)', padding: '10px 16px', boxSizing: 'border-box', zIndex: 20 },
  input: { flex: 1, background: '#0D1B14', border: '1px solid rgba(45,106,79,0.4)', borderRadius: 12, padding: '10px 14px', color: '#E8F5E9', fontFamily: "'Lato', sans-serif", fontSize: 14, outline: 'none', transition: 'border-color 0.2s' },
  sendBtn: (active) => ({ background: active ? '#52B788' : '#1a2e22', border: 'none', borderRadius: 12, padding: '10px 16px', color: active ? '#0D1B14' : '#2D6A4F', fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 18, cursor: active ? 'pointer' : 'not-allowed', transition: 'all 0.2s', lineHeight: 1 }),
  bubble: (mine) => ({
    background: mine ? '#52B788' : '#122018',
    border: mine ? 'none' : '1px solid rgba(45,106,79,0.3)',
    borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
    padding: '9px 13px', maxWidth: '78%'
  }),
  bubbleText: (mine) => ({ fontFamily: "'Lato', sans-serif", color: mine ? '#0D1B14' : '#E8F5E9', fontSize: 14, margin: 0, lineHeight: 1.5, wordBreak: 'break-word' }),
  emptyState: { fontFamily: "'Lato', sans-serif", color: '#2D6A4F', fontSize: 13, textAlign: 'center', paddingTop: 32 },
  postCard: { background: '#122018', border: '1px solid rgba(45,106,79,0.25)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 },
  postName: { fontFamily: "'Sora', sans-serif", color: '#52B788', fontSize: 12, fontWeight: 700, margin: '0 0 4px' },
  postContent: { fontFamily: "'Lato', sans-serif", color: '#C8E6C9', fontSize: 13, margin: 0, lineHeight: 1.5 },
  postTime: { fontFamily: "'Lato', sans-serif", color: '#2D6A4F', fontSize: 10, margin: '5px 0 0' },
  textarea: { width: '100%', background: '#0D1B14', border: '1px solid rgba(45,106,79,0.4)', borderRadius: 10, padding: '10px 12px', color: '#E8F5E9', fontFamily: "'Lato', sans-serif", fontSize: 13, outline: 'none', boxSizing: 'border-box', minHeight: 56, resize: 'none', marginBottom: 8, lineHeight: 1.5 },
  groupSendBtn: (active) => ({ width: '100%', background: active ? '#52B788' : '#1a2e22', border: 'none', borderRadius: 10, padding: '10px', color: active ? '#0D1B14' : '#2D6A4F', fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 13, cursor: active ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }),
  unreadDot: { width: 8, height: 8, background: '#52B788', borderRadius: '50%', marginLeft: 'auto', flexShrink: 0 },
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [groupMessages, setGroupMessages] = useState([])
  const [contactList, setContactList] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [dmMessages, setDmMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [unreadMap, setUnreadMap] = useState({})   // contactId → true
  const dmScrollRef = useRef(null)
  const inputRef = useRef(null)

  /* ── Auth ──────────────────────────────────────────────────── */
  useEffect(() => {
    async function fetchUser() {
      try {
        // Support both supabase session and legacy localStorage id
        const { data: { session } } = await supabase.auth.getSession()
        let userId = session?.user?.id || localStorage.getItem('kiruare_user_id')
        if (!userId) { router.push('/signup'); return }

        const { data, error } = await supabase.from('users').select('*').eq('id', userId).single()
        if (error || !data) {
          localStorage.removeItem('kiruare_user_id')
          router.push('/signup')
          return
        }
        setUser(data)
      } catch (err) {
        console.error('Auth error:', err)
        router.push('/signup')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  /* ── Group messages + contacts ─────────────────────────────── */
  useEffect(() => {
    if (!user) return
    const table = user.is_committee ? 'announcements' : 'member_announcements'

    async function fetchGroupMessages() {
      const { data, error } = await supabase
        .from(table)
        .select('*, users(id, name)')
        .order('created_at', { ascending: false })
        .limit(50)
      if (!error) setGroupMessages(data || [])
    }

    async function fetchContacts() {
      const { data, error } = await supabase.from('users').select('*').neq('id', user.id)
      if (error || !data) return
      // committee sees committee peers; members see other members
      setContactList(user.is_committee ? data.filter(u => u.is_committee) : data.filter(u => !u.is_committee))
    }

    fetchGroupMessages()
    fetchContacts()

    // ── Real-time: group channel ───────────────────────────────
    const groupChannel = supabase
      .channel(`group-${table}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table }, async (payload) => {
        // fetch the new row with user join
        const { data } = await supabase
          .from(table)
          .select('*, users(id, name)')
          .eq('id', payload.new.id)
          .single()
        if (data) setGroupMessages(prev => [data, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(groupChannel) }
  }, [user])

  /* ── DM fetch + real-time ──────────────────────────────────── */
  useEffect(() => {
    if (!selectedContact || !user) return

    async function fetchDMs() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })
      if (!error) {
        setDmMessages(data || [])
        setTimeout(() => scrollToBottom(dmScrollRef), 50)
      }
    }

    fetchDMs()

    // Mark as read
    setUnreadMap(prev => { const n = { ...prev }; delete n[selectedContact.id]; return n })

    // ── Real-time: DM channel ──────────────────────────────────
    const dmChannel = supabase
      .channel(`dm-${user.id}-${selectedContact.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new
        const isRelevant = (
          (msg.sender_id === user.id && msg.receiver_id === selectedContact.id) ||
          (msg.sender_id === selectedContact.id && msg.receiver_id === user.id)
        )
        if (isRelevant) {
          setDmMessages(prev => {
            // deduplicate optimistic messages by temp id
            const withoutTemp = prev.filter(m => !m._temp || m.content !== msg.content || m.sender_id !== msg.sender_id)
            return [...withoutTemp, msg]
          })
          setTimeout(() => scrollToBottom(dmScrollRef), 50)
        }
      })
      .subscribe()

    // ── Real-time: unread badge for OTHER contacts ─────────────
    const unreadChannel = supabase
      .channel(`unread-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new
        if (msg.receiver_id === user.id && msg.sender_id !== selectedContact?.id) {
          setUnreadMap(prev => ({ ...prev, [msg.sender_id]: true }))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(dmChannel)
      supabase.removeChannel(unreadChannel)
    }
  }, [selectedContact, user])

  /* ── Send group message ────────────────────────────────────── */
  async function sendGroupMessage() {
    const content = newMessage.trim()
    if (!content || !user || sending) return
    setSending(true)

    // Optimistic update
    const temp = { id: `temp-${Date.now()}`, content, author_id: user.id, created_at: new Date().toISOString(), users: { id: user.id, name: user.name }, _temp: true }
    setGroupMessages(prev => [temp, ...prev])
    setNewMessage('')

    try {
      const table = user.is_committee ? 'announcements' : 'member_announcements'
      const { error } = await supabase.from(table).insert({ author_id: user.id, content })
      if (error) {
        // rollback optimistic
        setGroupMessages(prev => prev.filter(m => m.id !== temp.id))
        setNewMessage(content)
        console.error('Send error:', error)
      }
      // Real-time subscription will push the confirmed row
    } finally {
      setSending(false)
    }
  }

  /* ── Send DM ───────────────────────────────────────────────── */
  async function sendDM() {
    const content = newMessage.trim()
    if (!content || !user || !selectedContact || sending) return
    setSending(true)

    // Optimistic update
    const temp = { id: `temp-${Date.now()}`, content, sender_id: user.id, receiver_id: selectedContact.id, created_at: new Date().toISOString(), _temp: true }
    setDmMessages(prev => [...prev, temp])
    setNewMessage('')
    setTimeout(() => scrollToBottom(dmScrollRef), 30)

    try {
      const { error } = await supabase.from('messages').insert({ sender_id: user.id, receiver_id: selectedContact.id, content })
      if (error) {
        setDmMessages(prev => prev.filter(m => m.id !== temp.id))
        setNewMessage(content)
        console.error('DM send error:', error)
      }
      // Real-time subscription handles confirmed row
    } finally {
      setSending(false)
    }
  }

  /* ── Key handler ───────────────────────────────────────────── */
  const handleKeyDown = useCallback((e, fn) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); fn() }
  }, [])

  /* ── Loading ───────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ ...S.root, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #1B4332', borderTop: '3px solid #52B788', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontFamily: "'Lato', sans-serif", color: '#52B788', margin: 0, fontSize: 13 }}>Loading…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!user) return null

  /* ══════════════════════════════════════════════════════════════
     DM VIEW
  ══════════════════════════════════════════════════════════════ */
  if (selectedContact) {
    return (
      <div style={S.root}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.headerRow}>
            <button style={S.backBtn} onClick={() => setSelectedContact(null)} aria-label="Back">
              ←
            </button>
            <Avatar name={selectedContact.name} size={36} />
            <div>
              <p style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', margin: 0, fontWeight: 700, fontSize: 15 }}>{selectedContact.name}</p>
              {selectedContact.residence && (
                <p style={{ fontFamily: "'Lato', sans-serif", color: '#52B788', margin: '1px 0 0', fontSize: 11 }}>{selectedContact.residence}</p>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={dmScrollRef} style={{ flex: 1, padding: '16px 16px 140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {dmMessages.length === 0 && (
            <p style={S.emptyState}>No messages yet. Say hello! 👋</p>
          )}
          {dmMessages.map((msg, i) => {
            const mine = msg.sender_id === user.id
            const prevMine = i > 0 && dmMessages[i - 1].sender_id === msg.sender_id
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginTop: prevMine ? 2 : 10 }}>
                <div style={S.bubble(mine)}>
                  <p style={S.bubbleText(mine)}>{msg.content}</p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 3, gap: 4, alignItems: 'center' }}>
                    <TimeLabel ts={msg.created_at} />
                    {mine && msg._temp && <span style={{ fontSize: 9, opacity: 0.5, fontFamily: "'Lato', sans-serif" }}>sending</span>}
                    {mine && !msg._temp && <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>✓</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Input */}
        <div style={S.inputBar}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <input
              ref={inputRef}
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => handleKeyDown(e, sendDM)}
              placeholder="Message…"
              style={S.input}
              autoComplete="off"
            />
            <button onClick={sendDM} disabled={!newMessage.trim() || sending} style={S.sendBtn(!!newMessage.trim() && !sending)} aria-label="Send">
              ↑
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════════════════════
     MAIN VIEW
  ══════════════════════════════════════════════════════════════ */
  return (
    <div style={S.root}>
      {/* Header */}
      <div style={S.header}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', margin: 0, fontSize: 18, fontWeight: 800 }}>Messages</h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 100px' }}>

        {/* ── Group Section ────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <p style={S.sectionLabel}>
            {user.is_committee ? '👮 Admin Group' : '👥 Member Group'}
          </p>

          {/* Compose */}
          <div style={{ background: '#122018', border: '1px solid rgba(45,106,79,0.25)', borderRadius: 14, padding: '12px 14px', marginBottom: 14 }}>
            <textarea
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => handleKeyDown(e, sendGroupMessage)}
              placeholder="Post to the group…"
              style={S.textarea}
            />
            <button onClick={sendGroupMessage} disabled={!newMessage.trim() || sending} style={S.groupSendBtn(!!newMessage.trim() && !sending)}>
              {sending ? 'Sending…' : 'Post'}
            </button>
          </div>

          {/* Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {groupMessages.length === 0 && (
              <p style={S.emptyState}>No posts yet. Be the first!</p>
            )}
            {groupMessages.slice(0, 10).map(msg => (
              <div key={msg.id} style={S.postCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Avatar name={msg.users?.name || '?'} size={28} />
                  <p style={S.postName}>{msg.users?.name || 'Unknown'}</p>
                  <span style={{ marginLeft: 'auto' }}><TimeLabel ts={msg.created_at} /></span>
                </div>
                <p style={S.postContent}>{msg.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── DM Section ───────────────────────────────────────── */}
        <div>
          <p style={S.sectionLabel}>Direct Messages</p>
          {contactList.length === 0 ? (
            <p style={S.emptyState}>No contacts available</p>
          ) : (
            contactList.map(contact => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                style={S.contactBtn}
              >
                <Avatar name={contact.name} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={S.contactName}>{contact.name}</p>
                  {contact.residence && <p style={S.contactSub}>{contact.residence}</p>}
                </div>
                {unreadMap[contact.id] && <span style={S.unreadDot} />}
              </button>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
