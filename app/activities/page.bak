'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import BottomNav from '../components/BottomNav'

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActivities() {
      try {
        const { data, error } = await supabase.from('activities').select('*').order('date', { ascending: false })
        if (error) throw error
        setActivities(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchActivities()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B14', maxWidth: 430, margin: '0 auto' }}>
      <div style={{ background: '#122018', borderBottom: '1px solid #2D6A4F33', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 10 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", color: '#E8F5E9', margin: 0, fontSize: 18, fontWeight: 800 }}>Activities</h2>
      </div>

      <div style={{ padding: '16px 20px', paddingBottom: 100 }}>
        {loading ? (
          <p style={{ color: '#52B788', textAlign: 'center', marginTop: 40 }}>Loading...</p>
        ) : (
          <>
            {activities.length > 0 ? (
              activities.map(a => (
                <div key={a.id} style={{ background: '#122018', border: '1px solid #2D6A4F33', borderRadius: 14, padding: 18, marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontFamily: "'Sora', sans-serif", color: '#E8F5E9', fontWeight: 700, fontSize: 15 }}>{a.title}</p>
                    <span style={{
                      background: a.status === 'upcoming' ? '#2D6A4F33' : '#1a2a22',
                      color: a.status === 'upcoming' ? '#52B788' : '#556B5A',
                      fontFamily: "'Lato', sans-serif", fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                      border: `1px solid ${a.status === 'upcoming' ? '#2D6A4F55' : '#333'}`,
                    }}>
                      {a.status === 'upcoming' ? 'Upcoming' : 'Done'}
                    </span>
                  </div>
                  <p style={{ margin: '6px 0 0', fontFamily: "'Lato', sans-serif", color: '#52B788', fontSize: 13 }}>📅 {new Date(a.date).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p style={{ color: '#2D6A4F', textAlign: 'center', marginTop: 40 }}>No activities yet</p>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
  }
