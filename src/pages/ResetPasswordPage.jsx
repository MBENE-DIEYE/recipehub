import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabase"

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      setMessage("Le password non coincidono.")
      return
    }
    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) setMessage("Errore durante il cambio password. Riprova.")
    else {
      setMessage("Password aggiornata! Reindirizzamento...")
      setTimeout(() => navigate("/"), 2000)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-orange-500 mb-2">AfriCook</h1>
        <p className="text-gray-500 mb-6">Imposta una nuova password</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Nuova password..."
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <input
            type="password"
            placeholder="Conferma password..."
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            minLength={6}
            className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          {message && (
            <p className={`text-sm ${message.includes("Errore") || message.includes("coincidono") ? "text-red-500" : "text-green-600"}`}>
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Salvataggio..." : "Salva nuova password"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordPage
