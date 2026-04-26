import { useState } from 'react'

const API = 'https://productivity-webapp-production.up.railway.app'

export default function App() {
  const [screen, setScreen] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(null)
  const [todos, setTodos] = useState([])
  const [task, setTask] = useState('')
  const [error, setError] = useState('')

  async function register() {
    const res = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    if (data.registered) {
      setError('Registered! Now login.')
      setScreen('login')
    } else {
      setError(data.error)
    }
  }

  async function login() {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    if (data.token) {
      setToken(data.token)
      setScreen('todos')
      loadTodos(data.token)
    } else {
      setError(data.error)
    }
  }

  async function loadTodos(t) {
    const res = await fetch(`${API}/todos`, {
      headers: { 'Authorization': `Bearer ${t || token}` }
    })
    const data = await res.json()
    setTodos(data.todos)
  }

  async function addTodo() {
    if (!task) return
    await fetch(`${API}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ task })
    })
    setTask('')
    loadTodos()
  }

  async function markDone(id) {
    await fetch(`${API}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    loadTodos()
  }

  async function deleteTodo(id) {
    await fetch(`${API}/todos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    loadTodos()
  }

  if (screen === 'login' || screen === 'register') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {screen === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 mb-3 text-sm outline-none focus:border-gray-400"
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 mb-4 text-sm outline-none focus:border-gray-400"
          />
          {screen === 'login'
            ? <button onClick={login} className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition">Login</button>
            : <button onClick={register} className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition">Register</button>
          }
          <p className="text-center text-sm text-gray-400 mt-4">
            {screen === 'login'
              ? <span onClick={() => { setScreen('register'); setError('') }} className="cursor-pointer text-gray-600 hover:underline">No account? Register</span>
              : <span onClick={() => { setScreen('login'); setError('') }} className="cursor-pointer text-gray-600 hover:underline">Have an account? Login</span>
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">My Todos</h2>
          <span onClick={() => { setToken(null); setScreen('login') }} className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">Logout</span>
        </div>
        <div className="flex gap-2 mb-6">
          <input
            placeholder="New task..."
            value={task}
            onChange={e => setTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400"
          />
          <button onClick={addTodo} className="bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition">Add</button>
        </div>
        <div className="space-y-2">
          {todos.map(todo => (
            <div key={todo.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition">
              <span className={`flex-1 text-sm ${todo.done ? 'line-through text-gray-300' : 'text-gray-700'}`}>
                {todo.task}
              </span>
              {!todo.done && (
                <button onClick={() => markDone(todo.id)} className="text-xs text-green-600 border border-green-200 px-2 py-1 rounded-lg hover:bg-green-50 transition">Done</button>
              )}
              <button onClick={() => deleteTodo(todo.id)} className="text-xs text-red-400 border border-red-100 px-2 py-1 rounded-lg hover:bg-red-50 transition">Delete</button>
            </div>
          ))}
          {todos.length === 0 && <p className="text-center text-sm text-gray-300 py-8">No todos yet. Add one above.</p>}
        </div>
      </div>
    </div>
  )
}