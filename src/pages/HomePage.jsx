import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { useAuth } from "../context/AuthContext"
import RecipeCard from "../components/RecipeCard"
import RecipeForm from "../components/RecipeForm"
import Login from "./Login"
import { Link, useNavigate } from "react-router-dom"

const HomePage = () => {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate("/")
  }
  const [recipes, setRecipes] = useState([])
  const [search, setSearch] = useState("")
  const [maxTime, setMaxTime] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [page, setPage] = useState(1)
  const PER_PAGE = 6

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("*, users(username)")

      if (error) console.error(error)
      else setRecipes(data ?? [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (user) fetchRecipes()
    else setRecipes([])
  }, [user])

  const resetFilters = () => {
    setSearch("")
    setMaxTime("")
    setSortBy("newest")
    setPage(1)
  }

  const filtered = recipes
    .filter(r => {
      const q = search.toLowerCase()
      const matchSearch = r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
      const matchTime = maxTime === "" || r.prep_time_min <= parseInt(maxTime)
      return matchSearch && matchTime
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at)
      if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at)
      if (sortBy === "fastest") return a.prep_time_min - b.prep_time_min
      return 0
    })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Caricamento...</p>
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-6 mb-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-orange-500">AfriCook</h1>
              <p className="text-gray-500 mt-1">Scopri e condividi le ricette della cucina africana</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="bg-white border border-orange-500 text-orange-500 px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors text-sm"
              >
                Il mio profilo
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors text-sm"
              >
                Esci
              </button>
            </div>
          </div>

          {/* Ricerca e filtri */}
          <div className="flex flex-col gap-3 mt-4">
            <input
              type="text"
              placeholder="Cerca per titolo o categoria..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <div className="flex gap-3 flex-wrap">
              <select
                value={maxTime}
                onChange={e => { setMaxTime(e.target.value); setPage(1) }}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                <option value="">Qualsiasi durata</option>
                <option value="15">Max 15 min</option>
                <option value="30">Max 30 min</option>
                <option value="60">Max 60 min</option>
                <option value="90">Max 90 min</option>
              </select>
              <select
                value={sortBy}
                onChange={e => { setSortBy(e.target.value); setPage(1) }}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                <option value="newest">Più recenti</option>
                <option value="oldest">Più vecchie</option>
                <option value="fastest">Più veloci</option>
              </select>
              {(search || maxTime || sortBy !== "newest") && (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Azzera filtri
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4">
        <RecipeForm onRecipeAdded={fetchRecipes} userId={user.id} />

        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">Nessuna ricetta trovata con questi filtri.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginated.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onDelete={fetchRecipes}
                userId={user.id}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 mb-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              ← Precedente
            </button>
            <span className="text-sm text-gray-500">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Successiva →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default HomePage
