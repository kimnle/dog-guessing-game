import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

ReactDOM.createRoot(document.getElementById("app")).render(
  // strict mode and development calls useEffect twice
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
