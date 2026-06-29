import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { supabase } from "../supabase"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

const StarRating = ({ value, onChange, readonly }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        onClick={() => !readonly && onChange(star)}
        className={`text-2xl transition-transform ${readonly ? "cursor-default" : "hover:scale-110"} ${star <= value ? "text-orange-400" : "text-gray-200"}`}
      >
        ★
      </button>
    ))}
  </div>
)

const RecipePage = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)

  // edit
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editPrepTime, setEditPrepTime] = useState("")
  const [editIngredients, setEditIngredients] = useState([""])
  const [editInstructions, setEditInstructions] = useState("")
  const [saving, setSaving] = useState(false)

  // ratings
  const [avgRating, setAvgRating] = useState(0)
  const [myRating, setMyRating] = useState(0)
  const [ratingCount, setRatingCount] = useState(0)

  // comments
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)

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

  const fetchRatings = async () => {
    const { data } = await supabase
      .from("ratings")
      .select("stars, user_id")
      .eq("recipe_id", id)

    if (data) {
      setRatingCount(data.length)
      setAvgRating(data.length > 0 ? Math.round(data.reduce((sum, r) => sum + r.stars, 0) / data.length) : 0)
      const mine = data.find(r => r.user_id === user?.id)
      if (mine) setMyRating(mine.stars)
    }
  }

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*, users(username)")
      .eq("recipe_id", id)
      .order("created_at", { ascending: false })

    setComments(data ?? [])
  }

  useEffect(() => {
    fetchRecipe()
    fetchRatings()
    fetchComments()
  }, [id])

  const handleRate = async (stars) => {
    const { error } = await supabase
      .from("ratings")
      .upsert({ recipe_id: id, user_id: user.id, stars }, { onConflict: "recipe_id,user_id" })

    if (error) toast.error("Errore durante la valutazione.")
    else {
      setMyRating(stars)
      fetchRatings()
      toast.success("Valutazione salvata!")
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setSubmittingComment(true)

    const { error } = await supabase
      .from("comments")
      .insert({ recipe_id: id, user_id: user.id, content: newComment.trim() })

    if (error) toast.error("Errore durante l'invio del commento.")
    else {
      setNewComment("")
      fetchComments()
      toast.success("Commento aggiunto!")
    }

    setSubmittingComment(false)
  }

  const handleDeleteComment = async (commentId) => {
    const { error } = await supabase.from("comments").delete().eq("id", commentId)
    if (error) toast.error("Errore durante l'eliminazione.")
    else {
      fetchComments()
      toast.success("Commento eliminato.")
    }
  }

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

    if (error) toast.error("Errore durante il salvataggio.")
    else {
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

      <main className="max-w-2xl mx-auto px-4 pb-8 flex flex-col gap-6">
        {isEditing ? (
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Modifica ricetta</h2>
            <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} required placeholder="Nome della ricetta..." className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" />
            <input type="text" value={editCategory} onChange={e => setEditCategory(e.target.value)} required placeholder="Categoria..." className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" />
            <input type="number" value={editPrepTime} onChange={e => setEditPrepTime(e.target.value)} required placeholder="Tempo (min)..." className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" />
            <div>
              <label className="text-sm text-gray-500 mb-2 block">Ingredienti</label>
              {editIngredients.map((ing, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input type="text" value={ing} onChange={e => handleIngredientChange(index, e.target.value)} placeholder={`Ingrediente ${index + 1}...`} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" />
                  {editIngredients.length > 1 && (
                    <button type="button" onClick={() => setEditIngredients(editIngredients.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-600 px-2">✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setEditIngredients([...editIngredients, ""])} className="text-sm text-orange-500 hover:text-orange-600">+ Aggiungi ingrediente</button>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Istruzioni</label>
              <textarea value={editInstructions} onChange={e => setEditInstructions(e.target.value)} rows={4} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50">{saving ? "Salvataggio..." : "Salva modifiche"}</button>
              <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">Annulla</button>
            </div>
          </form>
        ) : (
          <>
            {/* Dettaglio ricetta */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <span className="text-xs font-medium bg-orange-100 text-orange-600 px-3 py-1 rounded-full">{recipe.category}</span>
              <h1 className="text-3xl font-bold text-gray-800 mt-4 mb-2">{recipe.title}</h1>
              <p className="text-sm text-gray-500 mb-1">di <span className="font-medium text-gray-700">{recipe.users?.username}</span></p>
              <p className="text-sm text-gray-500 mb-4">Tempo: <span className="font-medium text-gray-700">{recipe.prep_time_min} min</span></p>

              {/* Valutazione media */}
              <div className="flex items-center gap-2 mb-6">
                <StarRating value={avgRating} readonly />
                <span className="text-sm text-gray-400">{ratingCount > 0 ? `${avgRating}/5 (${ratingCount} vot${ratingCount === 1 ? "o" : "i"})` : "Nessuna valutazione"}</span>
              </div>

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

            {/* La tua valutazione */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">La tua valutazione</h2>
              <StarRating value={myRating} onChange={handleRate} />
              {myRating > 0 && <p className="text-sm text-gray-400 mt-2">Hai dato {myRating} stelle</p>}
            </div>

            {/* Commenti */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Commenti ({comments.length})</h2>

              <form onSubmit={handleAddComment} className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Scrivi un commento..."
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  Invia
                </button>
              </form>

              {comments.length === 0 ? (
                <p className="text-gray-400 text-sm">Nessun commento ancora. Sii il primo!</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{comment.users?.username}</p>
                        <p className="text-gray-600 text-sm mt-1">{comment.content}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(comment.created_at).toLocaleDateString("it-IT")}</p>
                      </div>
                      {comment.user_id === user?.id && (
                        <button onClick={() => handleDeleteComment(comment.id)} className="text-xs text-red-400 hover:text-red-600 shrink-0">Elimina</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default RecipePage
