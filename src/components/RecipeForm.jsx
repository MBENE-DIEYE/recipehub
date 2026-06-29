import { useState } from "react"
import { supabase } from "../supabase"

const RecipeForm = ({ onRecipeAdded, userId }) => {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [prepTime, setPrepTime] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [image, setImage] = useState(null)
  const [ingredients, setIngredients] = useState([""])
  const [instructions, setInstructions] = useState("")

  const handleIngredientChange = (index, value) => {
    const updated = [...ingredients]
    updated[index] = value
    setIngredients(updated)
  }

  const addIngredient = () => setIngredients([...ingredients, ""])

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    let image_url = null

    if (image) {
      const fileExt = image.name.split(".").pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("recipes")
        .upload(fileName, image)

      if (uploadError) {
        console.error(uploadError)
        setError("Errore durante il caricamento dell'immagine.")
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from("recipes")
        .getPublicUrl(fileName)

      image_url = urlData.publicUrl
    }

    const { error } = await supabase
      .from("recipes")
      .insert({
        title,
        category,
        prep_time_min: parseInt(prepTime),
        user_id: userId,
        image_url,
        ingredients: ingredients.filter(i => i.trim() !== ""),
        instructions
      })

    if (error) {
      console.error(error)
      setError("Errore durante il salvataggio. Riprova.")
    } else {
      setTitle("")
      setCategory("")
      setPrepTime("")
      setIngredients([""])
      setInstructions("")
      setImage(null)
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

        <div>
          <label className="text-sm text-gray-500 mb-2 block">Ingredienti</label>
          {ingredients.map((ing, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder={`Ingrediente ${index + 1}...`}
                value={ing}
                onChange={e => handleIngredientChange(index, e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="text-red-400 hover:text-red-600 px-2"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="text-sm text-orange-500 hover:text-orange-600 transition-colors"
          >
            + Aggiungi ingrediente
          </button>
        </div>

        <div>
          <label className="text-sm text-gray-500 mb-1 block">Istruzioni</label>
          <textarea
            placeholder="Descrivi i passi per preparare la ricetta..."
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500 mb-1 block">Foto della ricetta (opzionale)</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files[0])}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-orange-100 file:text-orange-600 hover:file:bg-orange-200"
          />
        </div>

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
