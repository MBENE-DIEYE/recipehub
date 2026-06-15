const RecipeCard = ({ recipe }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex item-center justify-between mb-3">
                <span className="text-xs font-medium bg-orange-100 text-orange-600 px-3 py-1 rounded-full">{recipe.category}</span>
                <span className="text-sm text-gray-400 ">{recipe.prep_time_min} min</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2 ">{recipe.title}</h2>
            <p className="text-sm text-gray-500 ">per <span className="font-medium text-gray-700">{recipe.users.username}</span></p>
        </div>
    )
}

export default RecipeCard;