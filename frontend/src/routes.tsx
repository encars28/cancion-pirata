import { BrowserRouter, Route, Routes } from "react-router";
import { MainPage } from "./pages/mainpage";
import { PoemsPage } from "./pages/poemspage";
import { PoemPage } from "./pages/poempage";
import { AuthorsPage } from "./pages/authorspage";
import { AuthorPage } from "./pages/authorpage";
import { NothingFound } from "./components/NothingFound/NothingFound";

export default function AllRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/poems" element={<PoemsPage />} />
        <Route path="/poems/:id" element={<PoemPage />} />
        <Route path="/authors" element={<AuthorsPage />} />
        <Route path="/authors/:id" element={<AuthorPage />} />
        <Route path="*" element={<NothingFound />} />
      </Routes>
    </BrowserRouter>
  )
}