import { useEffect, useState } from "react"
import { supabase } from "../supabase"

const RecipeCard = ({ recipe, onDelete }) => {
    const [isFavorite, setIsFavorite] = useState(false)

    useEffect(() => {
        const checkFavorite = async () => {
            const { data: userData } = await supabase
                .from("users")
                .select("id")
                .eq("username", "marie")
                .single()

            const { data } = await supabase
                .from("favorites")
                .select("id")
                .eq("recipe_id", recipe.id)
                .eq("user_id", userData.id)
                .single()

            setIsFavorite(!!data)
        }
        checkFavorite()
    }, [recipe.id])

    const handleDelete = async () => {
        const { error } = await supabase
            .from("recipes")
            .delete()
            .eq("id", recipe.id)

        if (error) console.error(error)
        else onDelete()
    }

    const handleFavorite = async () => {
        const { data: userData } = await supabase
            .from("users")
            .select("id")
            .eq("username", "marie")
            .single()

        if (isFavorite) {
            await supabase
                .from("favorites")
                .delete()
                .eq("recipe_id", recipe.id)
                .eq("user_id", userData.id)
            setIsFavorite(false)
        } else {
            await supabase
                .from("favorites")
                .insert({
                    recipe_id: recipe.id,
                    user_id: userData.id
                })
            setIsFavorite(true)
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
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{recipe.title}</h2>
            <p className="text-sm text-gray-500">per <span className="font-medium text-gray-700">{recipe.users.username}</span></p>
            <div className="flex items-center justify-between mt-4">
                <button
                    onClick={handleFavorite}
                    className={`text-sm transition-colors ${isFavorite ? "text-red-500" : "text-gray-300 hover:text-red-400"}`}
                >
                    {isFavorite ? "❤️ Nei preferiti" : "🤍 Aggiungi ai preferiti"}
                </button>
                <button
                    onClick={handleDelete}
                    className="text-sm text-red-400 hover:text-red-600 transition-colors"
                >
                    Elimina ricetta
                </button>
            </div>
        </div>
    )
}

export default RecipeCard