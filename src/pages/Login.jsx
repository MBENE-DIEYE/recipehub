import { useState } from "react"
import { useAuth } from "../context/AuthContext"

const Login = () => {
  const { signIn, signUp } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    try {
      if (isRegister) {
        const data = await signUp(email, password, username)
        if (!data.session) {
          setMessage("Controlla la tua email per confermare la registrazione.")
        }
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      if (err.message.includes("security purposes") || err.message.includes("after")) {
        setError("Troppi tentativi. Aspetta qualche secondo e riprova.")
      } else if (err.message.includes("Invalid login credentials")) {
        setError("Email o password non corretti.")
      } else if (err.message.includes("User already registered")) {
        setError("Questa email è già registrata. Accedi invece di registrarti.")
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-orange-500 mb-2">RecipeHub</h1>
        <p className="text-gray-500 mb-6">
          {isRegister ? "Crea il tuo account" : "Accedi al tuo account"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Nome completo..."
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          )}
          <input
            type="email"
            placeholder="Email..."
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <input
            type="password"
            placeholder="Password..."
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Caricamento..." : isRegister ? "Registrati" : "Accedi"}
          </button>
        </form>

        <button
          onClick={() => { setIsRegister(!isRegister); setError(""); setMessage("") }}
          className="mt-4 text-sm text-gray-500 hover:text-orange-500 transition-colors w-full text-center"
        >
          {isRegister ? "Hai già un account? Accedi" : "Non hai un account? Registrati"}
        </button>
      </div>
    </div>
  )
}

export default Login
