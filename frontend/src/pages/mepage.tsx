import { Shell } from "../components/Shell/Shell";
import { Outlet, useLocation } from "react-router";

export function MePage() {
  const { pathname } = useLocation()

  return (
    <Shell profileNavbar fillBackground={!pathname.includes("settings")}>
      <Outlet />
    </Shell>
  )
}