import { Route, Routes } from "react-router";
import { MainPage } from "./pages/mainpage";
import { PoemsPage } from "./pages/poemspage";
import { PoemPage } from "./pages/poempage";
import { AuthorsPage } from "./pages/authorspage";
import { AuthorPage } from "./pages/authorpage";
import { LoginPage } from "./pages/loginpage";
import { NothingFound } from "./components/NothingFound/NothingFound";
import { isLoggedIn } from "./hooks/useAuth";
import { PasswordPage } from "./pages/passwordpage";
import { RegisterPage } from "./pages/registerpage";
import { AddPoemPage } from "./pages/addpoempage";
import { ResetPasswordPage } from "./pages/resetpasswordpage";
import { MePage } from "./pages/mepage";
import useAuth from "./hooks/useAuth";
import { AdminPage } from "./pages/adminpage";

export default function AllRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/poems" element={<PoemsPage />} />
      <Route path="/poems/:id" element={<PoemPage />} />
      <Route path="/poems/add" element={<AddPoemPage />} />
      <Route path="/authors" element={<AuthorsPage />} />
      <Route path="/authors/:id" element={<AuthorPage />} />
      <Route path="/me" element={isLoggedIn() ? (<MePage />): (<MainPage />)} />
      <Route path="/admin" element={user?.is_superuser ? (<AdminPage />) : (<NothingFound />)} />
      <Route path="/login" element={isLoggedIn() ? (<MainPage/>) : (<LoginPage />)} />
      <Route path="/signup" element={<RegisterPage />} />
      <Route path="/password-recovery" element={<PasswordPage/>} />
      <Route path="/reset-password" element={isLoggedIn() ? (<MainPage/>) : (<ResetPasswordPage />)} />
      <Route path="*" element={<NothingFound />} />
    </Routes>
  )
}