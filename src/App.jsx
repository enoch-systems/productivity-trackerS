import { useState, useEffect, useRef } from 'react'

const API = 'https://productivity-webapp-production.up.railway.app'

function getTimeLeft(reminder_at) {
  const now = new Date()
  const then = new Date(reminder_at)
  const diff = then - now
  if (diff <= 0) return null
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { h, m, s, diff }
}

function Countdown({ reminder_at, onAlarm }) {
  const [left, setLeft] = useState(getTimeLeft(reminder_at))
  const fired = useRef(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const t = getTimeLeft(reminder_at)
      setLeft(t)
      if (!t && !fired.current) {
        fired.current = true
        onAlarm()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [reminder_at])

  if (!left) return <span className="text-xs text-red-400 font-medium">⏰ Time's up!</span>
  return (
    <span className="text-xs text-indigo-400 font-medium tabular-nums">
      ⏱ {left.h}h {left.m}m {left.s}s
    </span>
  )
}

function DayProgress() {
  const [pct, setPct] = useState(0)
  const [hoursLeft, setHoursLeft] = useState(0)

  useEffect(() => {
    function update() {
      const now = new Date()
      const mins = now.getHours() * 60 + now.getMinutes()
      setPct(Math.round((mins / 1440) * 100))
      setHoursLeft(Math.round((1440 - mins) / 60))
    }
    update()
    const i = setInterval(update, 60000)
    return () => clearInterval(i)
  }, [])

  return (
    <div className="px-4 py-3 bg-white border-b border-gray-100">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>Day progress</span>
        <span>{hoursLeft}h left today</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(null)
  const [notes, setNotes] = useState([])
  const [error, setError] = useState('')
  const [alarm, setAlarm] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', body: '', reminder_at: '' })
  const [tab, setTab] = useState('upcoming')

  async function register() {
    const res = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    if (data.registered) { setError('Registered! Now login.'); setScreen('login') }
    else setError(data.error)
  }

  async function login() {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    if (data.token) { setToken(data.token); setScreen('app'); loadNotes(data.token) }
    else setError(data.error)
  }

  async function loadNotes(t) {
    const res = await fetch(`${API}/notes`, {
      headers: { 'Authorization': `Bearer ${t || token}` }
    })
    const data = await res.json()
    setNotes(data.notes || [])
  }

  async function saveNote() {
    if (!form.title) return
    const method = editing ? 'PUT' : 'POST'
    const url = editing ? `${API}/notes/${editing.id}` : `${API}/notes`
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ ...form, done: editing?.done || false })
    })
    setForm({ title: '', body: '', reminder_at: '' })
    setEditing(null)
    setShowForm(false)
    loadNotes()
  }

  async function deleteNote(id) {
    await fetch(`${API}/notes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    loadNotes()
  }

  async function dismissNote(note) {
    await fetch(`${API}/notes/${note.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ ...note, done: true })
    })
    loadNotes()
  }

  function startEdit(note) {
    setEditing(note)
    setForm({
      title: note.title,
      body: note.body || '',
      reminder_at: note.reminder_at ? note.reminder_at.slice(0, 16) : ''
    })
    setShowForm(true)
  }

  const upcoming = notes.filter(n => !n.done && n.reminder_at)
  const plain = notes.filter(n => !n.done && !n.reminder_at)
  const done = notes.filter(n => n.done)
  const todayNotes = notes.filter(n => {
    if (!n.reminder_at) return false
    const d = new Date(n.reminder_at)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })

  if (screen === 'login' || screen === 'register') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">{screen === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p className="text-sm text-gray-400 mb-6">Your notes and reminders, always with you.</p>
          {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-3 text-sm outline-none focus:border-indigo-300" />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm outline-none focus:border-indigo-300" />
          <button onClick={screen === 'login' ? login : register}
            className="w-full bg-indigo-500 text-white rounded-xl py-3 text-sm font-medium hover:bg-indigo-600 transition">
            {screen === 'login' ? 'Login' : 'Register'}
          </button>
          <p className="text-center text-sm text-gray-400 mt-4">
            {screen === 'login'
              ? <span onClick={() => { setScreen('register'); setError('') }} className="cursor-pointer text-indigo-500">No account? Register</span>
              : <span onClick={() => { setScreen('login'); setError('') }} className="cursor-pointer text-indigo-500">Have an account? Login</span>
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">

      {/* Alarm banner */}
      {alarm && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-indigo-500 text-white px-4 py-3 flex items-center justify-between max-w-md mx-auto">
          <span className="text-sm font-medium">⏰ {alarm}</span>
          <button onClick={() => setAlarm(null)} className="text-white text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">My Space</h1>
          <p className="text-xs text-gray-400">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <button onClick={() => { setToken(null); setScreen('login') }} className="text-xs text-gray-400">Logout</button>
      </div>

      {/* Day progress */}
      <DayProgress />

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 flex">
        {['upcoming', 'notes', 'today', 'done'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-medium capitalize transition ${tab === t ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-gray-400'}`}>
            {t === 'upcoming' ? `⏰ Events` : t === 'notes' ? `📝 Notes` : t === 'today' ? `📅 Today` : `✓ Done`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
        {tab === 'upcoming' && (upcoming.length === 0
          ? <p className="text-center text-sm text-gray-300 py-12">No upcoming events.<br/>Add one below.</p>
          : upcoming.map(note => (
            <div key={note.id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-start justify-between mb-1">
                <p className="font-medium text-gray-800 text-sm">{note.title}</p>
                <div className="flex gap-2 ml-2">
                  <button onClick={() => startEdit(note)} className="text-xs text-gray-400">Edit</button>
                  <button onClick={() => deleteNote(note.id)} className="text-xs text-red-300">Delete</button>
                </div>
              </div>
              {note.body && <p className="text-xs text-gray-400 mb-2">{note.body}</p>}
              <div className="flex items-center justify-between">
                <Countdown reminder_at={note.reminder_at} onAlarm={() => setAlarm(note.title)} />
                <div className="flex gap-2">
                  <span className="text-xs text-gray-300">{new Date(note.reminder_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  <button onClick={() => dismissNote(note)} className="text-xs text-gray-400 underline">Dismiss</button>
                </div>
              </div>
            </div>
          ))
        )}

        {tab === 'notes' && (plain.length === 0
          ? <p className="text-center text-sm text-gray-300 py-12">No notes yet.<br/>Add one below.</p>
          : plain.map(note => (
            <div key={note.id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-start justify-between">
                <p className="font-medium text-gray-800 text-sm">{note.title}</p>
                <div className="flex gap-2 ml-2">
                  <button onClick={() => startEdit(note)} className="text-xs text-gray-400">Edit</button>
                  <button onClick={() => deleteNote(note.id)} className="text-xs text-red-300">Delete</button>
                </div>
              </div>
              {note.body && <p className="text-xs text-gray-400 mt-1">{note.body}</p>}
              <p className="text-xs text-gray-200 mt-2">{new Date(note.created_at).toLocaleDateString('en-GB')}</p>
            </div>
          ))
        )}

        {tab === 'today' && (todayNotes.length === 0
          ? <p className="text-center text-sm text-gray-300 py-12">Nothing scheduled for today.</p>
          : todayNotes.map(note => (
            <div key={note.id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-start justify-between mb-1">
                <p className="font-medium text-gray-800 text-sm">{note.title}</p>
                <span className="text-xs text-gray-300">{new Date(note.reminder_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {note.body && <p className="text-xs text-gray-400">{note.body}</p>}
              <div className="mt-2">
                <Countdown reminder_at={note.reminder_at} onAlarm={() => setAlarm(note.title)} />
              </div>
            </div>
          ))
        )}

        {tab === 'done' && (done.length === 0
          ? <p className="text-center text-sm text-gray-300 py-12">Nothing dismissed yet.</p>
          : done.map(note => (
            <div key={note.id} className="bg-white rounded-2xl border border-gray-100 p-4 opacity-50">
              <div className="flex items-start justify-between">
                <p className="font-medium text-gray-500 text-sm line-through">{note.title}</p>
                <button onClick={() => deleteNote(note.id)} className="text-xs text-red-300 ml-2">Delete</button>
              </div>
              {note.body && <p className="text-xs text-gray-400 mt-1">{note.body}</p>}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-end max-w-md mx-auto">
          <div className="bg-white rounded-t-3xl w-full p-6 space-y-3">
            <h3 className="font-semibold text-gray-800">{editing ? 'Edit' : 'New note or event'}</h3>
            <input placeholder="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-300" />
            <textarea placeholder="Body (optional)" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}
              rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-300 resize-none" />
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Reminder (optional)</label>
              <input type="datetime-local" value={form.reminder_at} onChange={e => setForm({ ...form, reminder_at: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-300" />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => { setShowForm(false); setEditing(null); setForm({ title: '', body: '', reminder_at: '' }) }}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-500">Cancel</button>
              <button onClick={saveNote}
                className="flex-1 bg-indigo-500 text-white rounded-xl py-2.5 text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-1/2 translate-x-1/2 bg-indigo-500 text-white rounded-full w-14 h-14 text-2xl shadow-lg hover:bg-indigo-600 transition z-30">
        +
      </button>
    </div>
  )
}