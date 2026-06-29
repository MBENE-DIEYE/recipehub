import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../supabase"

const Login = () => {
  const { signIn, signUp } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetMessage, setResetMessage] = useState("")
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

  const handleResetPassword = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) setResetMessage("Errore. Controlla l'email inserita.")
    else setResetMessage("Email inviata! Controlla la tua casella di posta.")
  }

  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-orange-500 mb-2">AfriCook</h1>
          <p className="text-gray-500 mb-6">Recupera la tua password</p>
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="La tua email..."
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              required
              className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            {resetMessage && <p className={`text-sm ${resetMessage.includes("Errore") ? "text-red-500" : "text-green-600"}`}>{resetMessage}</p>}
            <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600 transition-colors">
              Invia email di recupero
            </button>
          </form>
          <button onClick={() => { setIsForgotPassword(false); setResetMessage("") }} className="mt-4 text-sm text-gray-500 hover:text-orange-500 transition-colors w-full text-center">
            ← Torna al login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-orange-500 mb-2">AfriCook</h1>
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
        {!isRegister && (
          <button
            onClick={() => setIsForgotPassword(true)}
            className="mt-2 text-sm text-gray-400 hover:text-orange-500 transition-colors w-full text-center"
          >
            Hai dimenticato la password?
          </button>
        )}
      </div>
    </div>
  )
}

export default Login
