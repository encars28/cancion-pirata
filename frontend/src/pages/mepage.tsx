import { Shell } from "../components/Shell/Shell";
import { Outlet, useLocation } from "react-router";
import { ActionIcon, Affix, Tooltip } from "@mantine/core";
import { TbWritingSign } from "react-icons/tb";
import { isLoggedIn } from "../hooks/useAuth";
import { useNavigate } from "react-router";

export function MePage() {
  const { pathname } = useLocation()
  const navigate = useNavigate();

  return (
    <Shell profileNavbar fillBackground={!pathname.includes("settings")}>
      <Outlet />
    </Shell>
  )
}