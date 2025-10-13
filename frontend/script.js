// This file controls buttons & forms on the page
// It talks to the backend API (http://localhost:1444)
// It saves & uses JWT token for login/register
// It updates what user sees on the page (ex. welcome text)

// - Handle buttons & forms
// - Talk to backend API
// - Save & use JWT token
// - Add Authorization for login
// - Update page with results

const API_BASE = "http://localhost:1444" 
const TOKEN_KEY = "app-jwt" // key name to store JWT in localStorage

// Function to register a new user 
async function registerUser(username, password) { 
  const response = await fetch(`${API_BASE}/api/register`, { // Send POST request to backend /api/register
    method: "POST", 
    headers: { "Content-Type": "application/json" }, // Tell server -> send JSON
    body: JSON.stringify({ username, password }) // Send user data to backend
  })
  
  if (!response.ok) throw new Error(`register failed: ${response.status}`) // fail if server says not ok
  
  const data = await response.json() // read JSON data from backend
  localStorage.setItem(TOKEN_KEY, data.token) // save JWT token to localStorage for later use

  console.log("User registered:", data.username) // show success message in console
  return data 
}

// Function login existing user
async function loginUser(username, password) {
  // Send request login to backend -> /api/signin
  const response = await fetch(`${API_BASE}/api/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }) // turn data into JSON text before send
  })

  if (!response.ok) throw new Error(`login failed: ${response.status}`) // if response not OK, stop here

  const data = await response.json() // read JSON data from backend
  localStorage.setItem(TOKEN_KEY, data.token) // save JWT token to localStorage for later use

  console.log("User logged in:", data.username) // add log when login success
  return data
}

// Connect buttons & inputs from HTML 
const usernameInput = document.querySelector("#username") // find input username
const passwordInput = document.querySelector("#password") // find input password
const loginButton = document.querySelector("#login-button") // find Login/Register button
const output = document.querySelector("#output") // find <p id="output">
const logoutButton = document.querySelector("#logout-button") // find logout button in HTML

// when user clicks the login/register button 
loginButton.addEventListener("click", async () => {
  const username = usernameInput.value // get text user typed
  const password = passwordInput.value // get password user typed

  // Check info before send to backend
  if (!username || !password) { // check if username or password is empty
    output.textContent = "Please enter both username and password" // show message on page
    return // stop function here
  }

  // try to login first
  try { 
    const data = await loginUser(username, password) // call login function
    output.textContent = `Welcome back, ${data.username}!` // show success message
    showAfterLogin(data.username) // show user info & logout button after login
  } 
  // if login fails, try register
  catch (error) { 
    const data = await registerUser(username, password) // call register function
    output.textContent = `New account created for ${data.username}!` // show new user message
    showAfterLogin(data.username) // show user info & logout button after register
  }
}) // end click handler

// Function for hide login, show logout, display username
function showAfterLogin(username) { // show area after login success
  document.querySelector(".form").classList.add("hidden") // hide login form
  document.querySelector(".after-login").classList.remove("hidden") // show logout area
  document.getElementById("user-info").innerText = username // show username on screen
}

// when user clicks logout button, clear token & show login again
logoutButton.addEventListener("click", () => { // when user click logout button
  localStorage.removeItem(TOKEN_KEY) // remove saved JWT token from browser
  document.querySelector(".after-login").classList.add("hidden") // hide the after-login section
  document.querySelector(".form").classList.remove("hidden") // show the login form again
  document.getElementById("output").innerText = "You have logged out." // show logout message
  console.log("User logged out") // add log when user logout
})

// Check if user already logged in when page loads
window.addEventListener("DOMContentLoaded", async () => { 
    const token = localStorage.getItem(TOKEN_KEY) // get saved token from browser
    if (!token) return // if no token, stop here (user not logged in)

    // Use fetch to send token to backend to check if it's valid & who the user is.
    try { 
    const res = await fetch(`${API_BASE}/api/users/me`, { // call backend to check who user is
    headers: { Authorization: `Bearer ${token}` } // send token to server
    })

    // If token works, get user info & show username.
    if (!res.ok) return // if server says token invalid, stop
    const data = await res.json() // read user data from backend
    showAfterLogin(data.username) // show logged-in area with username
    } catch (err) {
    console.log("Auto-login failed:", err.message) // show error if something goes wrong
    }
    // the website can auto login after refresh
})

