
import { Route, Routes } from "react-router-dom"
import RecipePage from "./pages/RecipePage"
import ProfilePage from "./pages/ProfilePage"
import HomePage from "./pages/HomePage"

const App = () => {

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recipe/:id" element={<RecipePage />} />
        <Route path="/profile" element={<ProfilePage />} />

      </Routes>
    </>
  )
}

export default App
