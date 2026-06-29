import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { supabase } from "../supabase"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

const RecipePage = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editPrepTime, setEditPrepTime] = useState("")
  const [editIngredients, setEditIngredients] = useState([""])
  const [editInstructions, setEditInstructions] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchRecipe = async () => {
    const { data, error } = await supabase
      .from("recipes")
      .select("*, users(username)")
      .eq("id", id)
      .single()

    if (error) console.error(error)
    else setRecipe(data)
    setLoading(false)
  }

  useEffect(() => { fetchRecipe() }, [id])

  const startEdit = () => {
    setEditTitle(recipe.title)
    setEditCategory(recipe.category)
    setEditPrepTime(recipe.prep_time_min)
    setEditIngredients(recipe.ingredients?.length > 0 ? recipe.ingredients : [""])
    setEditInstructions(recipe.instructions || "")
    setIsEditing(true)
  }

  const handleIngredientChange = (index, value) => {
    const updated = [...editIngredients]
    updated[index] = value
    setEditIngredients(updated)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from("recipes")
      .update({
        title: editTitle,
        category: editCategory,
        prep_time_min: parseInt(editPrepTime),
        ingredients: editIngredients.filter(i => i.trim() !== ""),
        instructions: editInstructions
      })
      .eq("id", id)

    if (error) {
      toast.error("Errore durante il salvataggio.")
    } else {
      toast.success("Ricetta aggiornata!")
      setIsEditing(false)
      fetchRecipe()
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Caricamento...</p>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Ricetta non trovata.</p>
      </div>
    )
  }

  const isOwner = user?.id === recipe.user_id

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-6 mb-8">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="text-orange-500 hover:text-orange-600 text-sm font-medium">
            ← Torna alle ricette
          </Link>
          {isOwner && !isEditing && (
            <button
              onClick={startEdit}
              className="bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors text-sm"
            >
              Modifica ricetta
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-8">
        {isEditing ? (
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Modifica ricetta</h2>
            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              required
              placeholder="Nome della ricetta..."
              className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <input
              type="text"
              value={editCategory}
              onChange={e => setEditCategory(e.target.value)}
              required
              placeholder="Categoria..."
              className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <input
              type="number"
              value={editPrepTime}
              onChange={e => setEditPrepTime(e.target.value)}
              required
              placeholder="Tempo di preparazione (min)..."
              className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <div>
              <label className="text-sm text-gray-500 mb-2 block">Ingredienti</label>
              {editIngredients.map((ing, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={ing}
                    onChange={e => handleIngredientChange(index, e.target.value)}
                    placeholder={`Ingrediente ${index + 1}...`}
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  {editIngredients.length > 1 && (
                    <button type="button" onClick={() => setEditIngredients(editIngredients.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-600 px-2">✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setEditIngredients([...editIngredients, ""])} className="text-sm text-orange-500 hover:text-orange-600">
                + Aggiungi ingrediente
              </button>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Istruzioni</label>
              <textarea
                value={editInstructions}
                onChange={e => setEditInstructions(e.target.value)}
                rows={4}
                placeholder="Descrivi i passi..."
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50">
                {saving ? "Salvataggio..." : "Salva modifiche"}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                Annulla
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <span className="text-xs font-medium bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
              {recipe.category}
            </span>
            <h1 className="text-3xl font-bold text-gray-800 mt-4 mb-2">{recipe.title}</h1>
            <p className="text-sm text-gray-500 mb-1">
              di <span className="font-medium text-gray-700">{recipe.users?.username}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Tempo: <span className="font-medium text-gray-700">{recipe.prep_time_min} min</span>
            </p>

            {recipe.image_url && (
              <img src={recipe.image_url} alt={recipe.title} className="w-full h-64 object-cover rounded-xl mb-6" />
            )}

            {recipe.ingredients?.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Ingredienti</h2>
                <ul className="flex flex-col gap-2">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700">
                      <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recipe.instructions && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Istruzioni</h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{recipe.instructions}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default RecipePage
