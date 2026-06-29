import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../supabase"
import { useAuth } from "../context/AuthContext"

const ProfilePage = () => {
    const { user, signOut } = useAuth()
    const [myRecipes, setMyRecipes] = useState([])
    const [favorites, setFavorites] = useState([])
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const [{ data: recipesData }, { data: favData }, { data: profileData }] = await Promise.all([
                supabase.from("recipes").select("*, users(username)").eq("user_id", user.id),
                supabase.from("favorites").select("recipe:recipes(*, users(username))").eq("user_id", user.id),
                supabase.from("users").select("username, email").eq("id", user.id).single()
            ])

            setMyRecipes(recipesData ?? [])
            setFavorites(favData?.map(f => f.recipe) ?? [])
            setProfile(profileData)
            setLoading(false)
        }

        fetchData()
    }, [user.id])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Caricamento...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm py-6 mb-8">
                <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
                    <Link to="/" className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                        ← Torna alle ricette
                    </Link>
                    <button
                        onClick={signOut}
                        className="bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors text-sm"
                    >
                        Esci
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4">
                {/* Info utente */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-500">
                            {(profile?.username || user.email)[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-800">{profile?.username || user.email}</p>
                            <p className="text-sm text-gray-400">{user.email}</p>
                            <p className="text-sm text-gray-400">{myRecipes.length} ricette pubblicate</p>
                        </div>
                    </div>
                </div>

                {/* Le mie ricette */}
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Le mie ricette</h2>
                {myRecipes.length === 0 ? (
                    <p className="text-gray-400 text-sm mb-8">Non hai ancora pubblicato ricette.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {myRecipes.map(recipe => (
                            <Link key={recipe.id} to={`/recipe/${recipe.id}`}>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                    <span className="text-xs font-medium bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                                        {recipe.category}
                                    </span>
                                    <h3 className="text-lg font-semibold text-gray-800 mt-3 hover:text-orange-500 transition-colors">
                                        {recipe.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-1">{recipe.prep_time_min} min</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* I miei preferiti */}
                <h2 className="text-xl font-semibold text-gray-800 mb-4">I miei preferiti</h2>
                {favorites.length === 0 ? (
                    <p className="text-gray-400 text-sm mb-8">Non hai ancora salvato ricette tra i preferiti.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {favorites.map(recipe => (
                            <Link key={recipe.id} to={`/recipe/${recipe.id}`}>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                    <span className="text-xs font-medium bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                                        {recipe.category}
                                    </span>
                                    <h3 className="text-lg font-semibold text-gray-800 mt-3 hover:text-orange-500 transition-colors">
                                        {recipe.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-1">
                                        di {recipe.users?.username} · {recipe.prep_time_min} min
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default ProfilePage
