import { Shell } from "../components/Shell/Shell";
import { Outlet } from "react-router";

export function AdminPage() {

  return (
    <Shell>
      <Outlet />
    </Shell >
  );
}