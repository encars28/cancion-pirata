import { Shell } from "../components/Shell/Shell";
import { Outlet } from "react-router";

export function MePage() {
  return (
    <Shell navbar>
      <Outlet />
    </Shell>
  )
}