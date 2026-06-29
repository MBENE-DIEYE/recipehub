
import { Route, Routes } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import RecipePage from "./pages/RecipePage"
import ProfilePage from "./pages/ProfilePage"
import HomePage from "./pages/HomePage"

const App = () => {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recipe/:id" element={<RecipePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  )
}

export default App
