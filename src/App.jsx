import { useState, useEffect } from 'react'
import { Moon, Clock, Sun, FileText, LogOut } from 'lucide-react'

const API = 'https://productivity-webapp-production.up.railway.app'

function DayProgress() {
  const [pct, setPct] = useState(0)
  const [countdowns, setCountdowns] = useState({})

  const targets = [
    { key: '6am', hour: 6, icon: Sun },
    { key: '8am', hour: 8, icon: Sun },
    { key: '12pm', hour: 12, icon: Sun },
    { key: '3pm', hour: 15, icon: Sun },
    { key: '5pm', hour: 17, icon: Sun },
    { key: '7pm', hour: 19, icon: Clock },
    { key: '11pm', hour: 23, icon: Moon },
    { key: '12am', hour: 24, icon: Moon },
  ]

  useEffect(() => {
    function update() {
      const now = new Date()
      const mins = now.getHours() * 60 + now.getMinutes()
      setPct(Math.round((mins / 1440) * 100))
      const newCountdowns = {}
      targets.forEach(target => {
        const targetTime = new Date(now)
        targetTime.setHours(target.hour, 0, 0, 0)
        if (targetTime < now) targetTime.setDate(targetTime.getDate() + 1)
        const diff = targetTime - now
        const h = Math.floor(diff / 3600000)
        const m = Math.floor((diff % 3600000) / 60000)
        const s = Math.floor((diff % 60000) / 1000)
        newCountdowns[target.key] = { h, m, s }
      })
      setCountdowns(newCountdowns)
    }
    update()
    const i = setInterval(update, 1000)
    return () => clearInterval(i)
  }, [])

  return (
    <div className="px-4 py-4 bg-slate-900">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
          <Moon className="w-3.5 h-3.5" /> Day Progress
        </span>
        <span className="text-xs font-medium text-slate-400">{pct}% complete</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-slate-400 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {targets.map(target => {
          const Icon = target.icon
          const cd = countdowns[target.key]
          return (
            <div key={target.key} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500">To {target.key}</span>
              </div>
              <div className="text-base font-semibold text-slate-200 tabular-nums">
                {cd?.h}h {cd?.m}m {cd?.s}s
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [notes, setNotes] = useState([])
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', body: '', reminder_at: '' })
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState(null)

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
      setScreen('app')
      loadNotes(token)
    } else {
      localStorage.removeItem('token')
      setScreen('login')
    }
  }, [token])

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
    const payload = editing
      ? { title: form.title, body: form.body, reminder_at: form.reminder_at || null, done: editing.done || false, updated_at: new Date().toISOString() }
      : { title: form.title, body: form.body, reminder_at: form.reminder_at || null, done: false }
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
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

  function startEdit(note) {
    setEditing(note)
    setForm({
      title: note.title,
      body: note.body || '',
      reminder_at: note.reminder_at ? new Date(note.reminder_at).toISOString().slice(0, 16) : ''
    })
    setShowForm(true)
  }

  if (screen === 'login' || screen === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl shadow-slate-900/10 border border-slate-200/50">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">
            {screen === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm text-slate-500 text-center mb-8">
            {screen === 'login' ? 'Sign in to your space' : 'Get started with your space'}
          </p>
          <div className="space-y-5">
            <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full border border-slate-300 rounded-2xl px-5 py-4 text-base outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all bg-slate-50/50" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-2xl px-5 py-4 text-base outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all bg-slate-50/50" />
            <button onClick={screen === 'login' ? login : register}
              className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl py-4 text-base font-semibold hover:from-slate-800 hover:to-slate-700 transition-all shadow-lg shadow-slate-900/20">
              {screen === 'login' ? 'Sign in' : 'Register'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm text-center mt-6 font-medium">{error}</p>}
          <p className="text-center text-sm text-slate-500 mt-8">
            {screen === 'login'
              ? <span onClick={() => { setScreen('register'); setError('') }} className="cursor-pointer text-slate-900 font-semibold">No account? Register</span>
              : <span onClick={() => { setScreen('login'); setError('') }} className="cursor-pointer text-slate-900 font-semibold">Have an account? Login</span>
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex flex-col">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-1">

        {/* Header */}
        <div className="bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50 px-6 pt-12 pb-5 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">My Space</h1>
            <p className="text-sm text-slate-300 mt-1 font-medium">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button onClick={() => setShowLogoutConfirm(true)}
            className="text-sm text-slate-300 hover:text-white transition font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-800">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Day progress */}
        <DayProgress />

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 pb-24">
          {notes.length === 0
            ? <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-400">No notes yet.<br />Add one below.</p>
              </div>
            : notes.map(note => (
                <div key={note.id} className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <p className="font-semibold text-slate-900 text-base flex-1">{note.title}</p>
                    <div className="flex gap-3 ml-4 flex-shrink-0">
                      <button onClick={() => startEdit(note)} className="text-xs font-medium text-slate-500 hover:text-slate-900 transition px-3 py-1.5 rounded-lg hover:bg-slate-100">Edit</button>
                      <button onClick={() => { setNoteToDelete(note); setShowDeleteConfirm(true) }} className="text-xs font-medium text-red-500 hover:text-red-700 transition px-3 py-1.5 rounded-lg hover:bg-red-50">Delete</button>
                    </div>
                  </div>
                  {note.body && <p className="text-sm text-slate-600 mt-1 leading-relaxed">{note.body}</p>}
                  {note.reminder_at && (
                    <p className="text-xs text-indigo-500 font-medium mt-2">
                      ⏰ {new Date(note.reminder_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  <div className="text-xs text-slate-400 mt-3 font-medium space-y-0.5">
                    <span className="block">Created: {new Date(note.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    {note.updated_at && <span className="block">Modified: {new Date(note.updated_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
                  </div>
                </div>
              ))
          }
        </div>

        {/* Add / Edit form */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-lg p-8 space-y-5 shadow-2xl border border-slate-200/50">
              <h3 className="font-bold text-slate-900 text-xl">{editing ? 'Edit note' : 'New note'}</h3>
              <input placeholder="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border border-slate-300 rounded-2xl px-5 py-4 text-base outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all bg-slate-50/50" />
              <textarea placeholder="Body (optional)" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}
                rows={4} className="w-full border border-slate-300 rounded-2xl px-5 py-4 text-base outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all resize-none bg-slate-50/50" />
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block font-medium">Reminder (optional)</label>
                <input type="datetime-local" value={form.reminder_at} onChange={e => setForm({ ...form, reminder_at: e.target.value })}
                  className="w-full border border-slate-300 rounded-2xl px-5 py-4 text-base outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all bg-slate-50/50" />
              </div>
              <div className="flex gap-4 pt-1">
                <button onClick={() => { setShowForm(false); setEditing(null); setForm({ title: '', body: '', reminder_at: '' }) }}
                  className="flex-1 border-2 border-slate-300 rounded-2xl py-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                <button onClick={saveNote}
                  className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl py-4 text-sm font-semibold hover:from-slate-800 hover:to-slate-700 transition-all shadow-lg shadow-slate-900/20">Save</button>
              </div>
            </div>
          </div>
        )}

        {/* FAB */}
        <button onClick={() => { setForm({ title: '', body: '', reminder_at: '' }); setShowForm(true) }}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-full shadow-2xl shadow-slate-900/30 hover:from-slate-800 hover:to-slate-700 transition-all hover:scale-105 z-30 flex items-center justify-center w-16 h-16 text-3xl">
          +
        </button>

        {/* Logout confirm */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-sm p-8 shadow-2xl border border-slate-200/50">
              <h3 className="text-xl font-bold text-slate-900 mb-3">Logout</h3>
              <p className="text-sm text-slate-600 mb-7">Are you sure you want to logout?</p>
              <div className="flex gap-4">
                <button onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 border-2 border-slate-300 rounded-2xl py-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                <button onClick={() => { setToken(null); setScreen('login'); setShowLogoutConfirm(false) }}
                  className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl py-4 text-sm font-semibold transition-all shadow-lg shadow-slate-900/20">Logout</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirm */}
        {showDeleteConfirm && noteToDelete && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-sm p-8 shadow-2xl border border-slate-200/50">
              <h3 className="text-xl font-bold text-slate-900 mb-3">Delete</h3>
              <p className="text-sm text-slate-600 mb-7">Are you sure you want to delete "{noteToDelete.title}"?</p>
              <div className="flex gap-4">
                <button onClick={() => { setShowDeleteConfirm(false); setNoteToDelete(null) }}
                  className="flex-1 border-2 border-slate-300 rounded-2xl py-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                <button onClick={() => { deleteNote(noteToDelete.id); setShowDeleteConfirm(false); setNoteToDelete(null) }}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl py-4 text-sm font-semibold transition-all shadow-lg shadow-red-500/20">Delete</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}