import { Route, Routes, Navigate, Outlet } from "react-router";
import { PoemsPage } from "./pages/poemspage";
import { PoemPage } from "./pages/poempage";
import { AuthorsPage } from "./pages/authorspage";
import { AuthorPage } from "./pages/authorpage";
import { NothingFound } from "./components/Error/NothingFound";
import { isAdmin, isLoggedIn } from "./hooks/useAuth";
import { MePage } from "./pages/mepage";
import { AdminPage } from "./pages/adminpage";
import { TableAuthors } from "./components/Tables/TableAuthors";
import { TableUsers } from "./components/Tables/TableUsers";
import { TablePoems } from "./components/Tables/TablePoems";
import { Profile } from "./components/User/Profile";
import { UpdatePasswordForm } from "./components/User/UpdatePassword";
import { AddPoem } from "./components/Poem/AddPoem";
import { PageSettings } from "./components/PageSettings";
import { BasePage } from "./pages/base";
import { RegisterForm } from "./components/Auth/RegisterForm/RegisterForm";
import { PasswordForm } from "./components/Auth/PasswordForm/PasswordForm";
import { LoginForm } from "./components/Auth/LoginForm/LoginForm";
import { ResetPassword } from "./components/Auth/ResetPassword/ResetPassword";
import { EditPoem } from "./components/Poem/EditPoem/EditPoem";
import { MainPage } from "./pages/mainpage";
import { UserPage } from "./pages/userpage";
import { CollectionPage } from "./pages/collectionpage";
import { VerifyAccount } from "./components/Auth/VerifyAccount";
import { LanguageHelp } from "./components/LanguageHelp/LanguageHelp";

type ProtectedRouteProps = {
  isAllowed: boolean;
  redirectPath?: string;
  children?: React.ReactNode;
};

const ProtectedRoute = ({
  isAllowed,
  redirectPath = "/",
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
      <Route index element={<MainPage />} />
      <Route element={<BasePage />}>
        <Route path="signup" element={<RegisterForm />} />
        <Route path="password-recovery" element={<PasswordForm />} />
        <Route path="help" element={<LanguageHelp />} />
      </Route>

      <Route path="poems" element={<PoemsPage />} />
      <Route path="poems/:id" element={<PoemPage />} />
      <Route path="authors" element={<AuthorsPage />} />
      <Route path="authors/:id" element={<AuthorPage />} />
      <Route path="users/:id" element={<UserPage />} />
      <Route path="collections/:id" element={<CollectionPage />} />

      <Route
        element={
          <ProtectedRoute isAllowed={isLoggedIn()} redirectPath="/login" />
        }
      >
        <Route path="poems/add" element={<BasePage />}>
          <Route index element={<AddPoem />} />
        </Route>

        <Route path="poems/edit/:id" element={<BasePage />}>
          <Route index element={<EditPoem />} />
        </Route>

        <Route path="me" element={<MePage />}>
          <Route index element={<Profile />} />
          <Route path="profile" element={<Profile />} />
          <Route path="password" element={<UpdatePasswordForm />} />
          <Route path="settings" element={<PageSettings />} />
          <Route path="*" element={<Profile />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute isAllowed={!isLoggedIn()} />}>
        <Route element={<BasePage />}>
          <Route path="login" element={<LoginForm />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>
        <Route path="verify-account" element={<VerifyAccount />} />
      </Route>

      <Route element={<ProtectedRoute isAllowed={isAdmin()} />}>
        <Route path="admin" element={<AdminPage />}>
          <Route index element={<TableUsers />} />
          <Route path="authors" element={<TableAuthors />} />
          <Route path="users" element={<TableUsers />} />
          <Route path="poems" element={<TablePoems />} />
          <Route path="*" element={<NothingFound />} />
        </Route>
      </Route>

      <Route path="*" element={<NothingFound />} />
    </Routes>
  );
}
