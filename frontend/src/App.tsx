import { useEffect, useState } from "react"
// import "./style.css" 

// simple types
type LoginBody = { username: string; password: string }
type Me = { id: number; username: string }
type UsersList = { users: string[] }

const TOKEN_KEY = "app-jwt" // where we store JWT in browser

const App = () => {
  // form state
  const [name, setName] = useState("")     // username input
  const [pass, setPass] = useState("")     // password input

  // auth / ui state
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY)) // read token on start
  const [me, setMe] = useState<Me | null>(null)   // who am I
  const [users, setUsers] = useState<string[]>([]) // list of usernames
  const [msg, setMsg] = useState<string>("Welcome to Secure Studio!") // small status message

  // save/remove token
  function saveToken(t: string) {
    localStorage.setItem(TOKEN_KEY, t) // keep token across refresh
    setToken(t)
  }
  function clearToken() {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setMe(null)
    setUsers([])
    setMsg("You have logged out.") // show message after logout
  }

  // register (used as fallback if login fails)
  async function doRegister() {
    const body: LoginBody = { username: name, password: pass }
    console.log("Register request", body)
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) { setMsg("Register failed"); console.warn("❌ register fail", res.status); return }
    const data = await res.json() as { id: number; username: string; token: string }
    saveToken(data.token)
    setMsg(`New account created for ${data.username}!`)
  }

  // get my profile (need token)
  async function loadUsers() {
    if (!token) { setMsg("No token"); return }
    const res = await fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) { setMsg("Cannot load users"); console.warn("❌ cannot load users", res.status); return }
    const data: UsersList = await res.json()
    setUsers(data.users)
  }

  // big button like old page: try login first; if fail → register
  async function handleLoginOrRegister() {
    console.log("CLICK Login/Register button") // check if button works
    if (!name || !pass) { setMsg("Please enter both username and password"); return }

    // try login first
    const tryLogin = await fetch("/api/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: name, password: pass } as LoginBody),
    })

    console.log("🔹 Login response:", tryLogin.status)

    if (tryLogin.ok) {
      const data = await tryLogin.json() as { id: number; username: string; token: string }
      saveToken(data.token)
      setMsg(`Welcome back, ${data.username}!`)
      return
    }

    // if login fails → register
    await doRegister()
  }

  // auto-load profile when token changes (inline to avoid hooks dependency warning)
  useEffect(() => {
    // easy eng: when token exists, fetch /api/users/me and set "me"
    if (!token) { setMe(null); return }

    (async () => {
      console.log("🔸 Loading /api/users/me with token...")
      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) { console.warn("❌ failed to get /me", res.status); return }
      const data: Me = await res.json()
      setMe(data)
      console.log("Me:", data)
    })()
  }, [token])

  return (
    <>
      {/* card container like old HTML */}
      <div className="card">
        <h1>Secure Studio</h1>

        {/* form area (hidden when logged in) */}
        <div className={`form ${token ? "hidden" : ""}`}>
          <label className="input-group">
            <span className="icon">✉️</span>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={name}
              onChange={(e) => setName(e.target.value)} // update name
            />
          </label>

          <label className="input-group">
            <span className="icon">🔒</span>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={pass}
              onChange={(e) => setPass(e.target.value)} // update password
            />
          </label>

          <button
            type="button"
            id="login-button"
            className="btn-primary"
            onClick={handleLoginOrRegister}
          >
            Login / Register
          </button>
        </div>

        {/* after-login area (show when token exists) */}
        <div className={`after-login ${token ? "" : "hidden"}`}>
          <p>
            You are logged in as: <code id="user-info">{me?.username ?? "User"}</code>
          </p>
          <div style={{ display: "flex", gap: ".5rem" }}>
            <button className="btn-secondary" onClick={clearToken}>Logout</button>
            <button className="btn-secondary" onClick={loadUsers}>Get Users</button>
          </div>
        </div>

        {/* output message like old page */}
        <p id="output" className="output">{msg}</p>

        {/* optional: show users list when loaded */}
        {users.length > 0 && (
          <ul className="list" style={{ marginTop: ".5rem" }}>
            {users.map(u => <li key={u}>{u}</li>)}
          </ul>
        )}
      </div>
    </>
  )
}

export default App
