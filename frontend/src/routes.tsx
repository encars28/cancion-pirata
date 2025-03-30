import { Route, Routes, Navigate, Outlet } from "react-router";
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
import { AdminPage } from "./pages/adminpage";
import { TableAuthors } from "./components/Tables/TableAuthors";
import { TableUsers } from "./components/Tables/TableUsers";
import { TablePoems } from "./components/Tables/TablePoems";
import { Profile } from "./components/Profile";

type ProtectedRouteProps = {
  isAllowed: boolean;
  redirectPath?: string;
  children?: React.ReactNode;
};

const ProtectedRoute = ({
  isAllowed,
  redirectPath = '/',
  children,
}: ProtectedRouteProps) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
};

export default function AllRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/signup" element={<RegisterPage />} />
      <Route path="/password-recovery" element={<PasswordPage />} />

      <Route path="/poems" element={<PoemsPage />}>
        <Route path=":id" element={<PoemPage />} />
        <Route path="*" element={<NothingFound />} />
      </Route>

      <Route path="/authors" element={<AuthorsPage />}>
        <Route path=":id" element={<AuthorPage />} />
        <Route path="*" element={<NothingFound />} />
      </Route>

      <Route element={<ProtectedRoute isAllowed={isLoggedIn()} />}>
        <Route path="/me" element={<MePage />}>
          <Route index element={<Profile />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<NothingFound />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute isAllowed={!isLoggedIn()} />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute isAllowed={true} />}>
        <Route path="/admin" element={<AdminPage />}>
          <Route index element={<TableUsers />} />
          <Route path="authors" element={<TableAuthors />} />
          <Route path="users" element={<TableUsers />} />
          <Route path="poems" element={<TablePoems />} />
          <Route path="*" element={<NothingFound />} />
        </Route>
      </Route>

      <Route path="*" element={<NothingFound />} />
    </Routes>
  )
}