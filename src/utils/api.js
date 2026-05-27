const TOKEN_KEY = 'nudgegreen_token'

export function getSavedToken() {
  return localStorage.getItem(TOKEN_KEY) ?? null
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('nudgegreen_user_id')
  localStorage.removeItem('nudgegreen_city')
}

function authHeaders() {
  const token = getSavedToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseJson(res) {
  try {
    return await res.json()
  } catch {
    throw new Error(
      res.ok
        ? 'Unexpected server response'
        : 'Cannot reach the server — make sure the backend is running on port 3001'
    )
  }
}

export async function signup(display_name, city, password) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ display_name, city, password }),
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.error ?? 'Signup failed')
  return data
}

export async function login(display_name, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ display_name, password }),
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.error ?? 'Login failed')
  return data
}

export async function logDecision({ decision_text, category, impact_level, co2_kg }) {
  const res = await fetch('/api/decisions/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ decision_text, category, impact_level, co2_kg }),
  })
  if (!res.ok) return { new_badges: [] }
  return parseJson(res)
}

export async function getLeaderboard() {
  const res = await fetch('/api/leaderboard', { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch leaderboard')
  return parseJson(res)
}

export async function getDashboard() {
  const res = await fetch('/api/dashboard', { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch dashboard')
  return parseJson(res)
}

export async function getBadges() {
  const res = await fetch('/api/badges', { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch badges')
  return parseJson(res)
}
