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
                            <img
                                src={recipe.image_url}
                                alt={recipe.title}
                                className="w-full h-64 object-cover rounded-xl mb-6"
                            />
                        )}

                        {recipe.ingredients?.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-3">Ingredienti</h2>
                                <ul className="flex flex-col gap-2">
                                    {recipe.ingredients.map((ing, i) => (
                                        <li key={i} className="flex items-center gap-2 text-gray-700">
                                            <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                                            {ing}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {recipe.instructions && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 mb-3">Istruzioni</h2>
                                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                    {recipe.instructions}
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    )
}

export default RecipePage
