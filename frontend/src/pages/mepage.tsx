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
      <Affix bottom={{ base: 100, xs: 60 }} right={{ base: 30, xs: 70 }}>
          <Tooltip label="Nuevo poema">
            <ActionIcon
              size={50}
              variant="filled"
              radius="xl"
              onClick={
                isLoggedIn()
                  ? () => navigate("/poems/add")
                  : () => navigate("/login")
              }
            >
              <TbWritingSign size={25} />
            </ActionIcon>
          </Tooltip>
      </Affix>
    </Shell>
  )
}