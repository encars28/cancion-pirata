import { BrowserRouter, Route, Routes } from "react-router";
import { MainPage } from "./pages/mainpage";
import { PoemsPage } from "./pages/poemspage";
import { AuthorsPage } from "./pages/authorspage";

export default function AllRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/poems" element={<PoemsPage />} />
        <Route path="/authors" element={<AuthorsPage />} />
      </Routes>
    </BrowserRouter>
  )
}