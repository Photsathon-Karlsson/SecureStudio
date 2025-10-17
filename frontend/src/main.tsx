// This file boots the React app & mounts <App /> into #root

import React from "react"            
import { createRoot } from "react-dom/client" 
import App from "./App"              

// find <div id="root"></div> in index.html and render App into it
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
