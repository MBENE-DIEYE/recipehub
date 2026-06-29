import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { Link } from "react-router-dom"

const RecipeCard = ({ recipe, onDelete, userId }) => {
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (!userId) return

    const checkFavorite = async () => {
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("recipe_id", recipe.id)
        .eq("user_id", userId)
        .maybeSingle()

      setIsFavorite(!!data)
    }

    checkFavorite()
  }, [recipe.id, userId])

  const handleDelete = async () => {
    if (!window.confirm(`Eliminare "${recipe.title}"? Questa azione non può essere annullata.`)) return

    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", recipe.id)

    if (error) console.error(error)
    else onDelete()
  }

  const handleFavorite = async () => {
    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("recipe_id", recipe.id)
        .eq("user_id", userId)
      if (!error) setIsFavorite(false)
      else console.error("Errore rimozione preferito:", error)
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ recipe_id: recipe.id, user_id: userId })
      if (!error) setIsFavorite(true)
      else console.error("Errore aggiunta preferito:", error)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
          {recipe.category}
        </span>
        <span className="text-sm text-gray-400">{recipe.prep_time_min} min</span>
      </div>
      <Link to={`/recipe/${recipe.id}`}>
        <h2 className="text-xl font-semibold text-gray-800 mb-2 hover:text-orange-500 transition-colors">
          {recipe.title}
        </h2>
      </Link>
      <p className="text-sm text-gray-500">
        per <span className="font-medium text-gray-700">{recipe.users?.username}</span>
      </p>
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handleFavorite}
          className={`text-sm transition-colors ${isFavorite ? "text-red-500" : "text-gray-300 hover:text-red-400"}`}
        >
          {isFavorite ? "❤️ Nei preferiti" : "🤍 Aggiungi ai preferiti"}
        </button>
        {userId === recipe.user_id && (
          <button
            onClick={handleDelete}
            className="text-sm text-red-400 hover:text-red-600 transition-colors"
          >
            Elimina ricetta
          </button>
        )}
      </div>
    </div>
  )
}

export default RecipeCard
