import { BrowserRouter, Route, Routes } from "react-router";
import MainPage from "./pages/mainpage";

export default function AllRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage />} />
            </Routes>
        </BrowserRouter>
    )
}