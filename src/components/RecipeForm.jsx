import { useState } from "react"
import { supabase } from "../supabase"

const RecipeForm = ({ onRecipeAdded, userId }) => {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [prepTime, setPrepTime] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase
      .from("recipes")
      .insert({
        title,
        category,
        prep_time_min: parseInt(prepTime),
        user_id: userId
      })

    if (error) {
      console.error(error)
      setError("Errore durante il salvataggio. Riprova.")
    } else {
      setTitle("")
      setCategory("")
      setPrepTime("")
      onRecipeAdded()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Aggiungi una ricetta</h2>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nome della ricetta..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <input
          type="text"
          placeholder="Categoria..."
          value={category}
          onChange={e => setCategory(e.target.value)}
          required
          className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <input
          type="number"
          placeholder="Tempo di preparazione (min)..."
          value={prepTime}
          onChange={e => setPrepTime(e.target.value)}
          required
          className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {loading ? "Salvataggio..." : "Aggiungi ricetta"}
        </button>
      </div>
    </form>
  )
}

export default RecipeForm
