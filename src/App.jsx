import { useEffect, useState } from "react"
import { supabase } from "./supabase"
import RecipeCard from "./components/RecipeCard"
import RecipeForm from "./components/RecipeForm"

const App = () => {
  const [recipes, setRecipes] = useState([])
  const [search, setSearch] = useState("")

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("*, users(username)")

      if (error) console.error(error)
      else setRecipes(data ?? [])

    } catch (error) {
      console.error(error)
    }
  }

  const filtered = recipes.filter(r =>
    r.category.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    fetchRecipes()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-6 mb-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-orange-500">RecipeHub</h1>
          <p className="text-gray-500 mt-1">Scopri e condividi le tue ricette preferite</p>
          <input
            type="text"
            placeholder="Cerca per categoria..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full mt-4 px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4">
        <RecipeForm onRecipAdded={fetchRecipes} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} onDelete={fetchRecipes} />
          ))}
        </div>
      </main>
    </div>
  )
}

export default App