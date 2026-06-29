import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { supabase } from "../supabase"

const RecipePage = () => {
    const { id } = useParams()
    const [recipe, setRecipe] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
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

        fetchRecipe()
    }, [id])

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

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm py-6 mb-8">
                <div className="max-w-2xl mx-auto px-4">
                    <Link to="/" className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                        ← Torna alle ricette
                    </Link>
                </div>
            </header>
            <main className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <span className="text-xs font-medium bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                        {recipe.category}
                    </span>
                    <h1 className="text-3xl font-bold text-gray-800 mt-4 mb-2">{recipe.title}</h1>
                    <p className="text-sm text-gray-500 mb-1">
                        di <span className="font-medium text-gray-700">{recipe.users?.username}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                        Tempo: <span className="font-medium text-gray-700">{recipe.prep_time_min} min</span>
                    </p>
                </div>
            </main>
        </div>
    )
}

export default RecipePage
