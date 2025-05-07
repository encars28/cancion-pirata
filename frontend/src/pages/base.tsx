import { Shell } from "../components/Shell/Shell";
import { Outlet } from "react-router";

export function BasePage() {
  return (
    <Shell>
      <Outlet />
    </Shell>
  )
}