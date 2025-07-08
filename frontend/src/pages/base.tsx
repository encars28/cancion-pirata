import { Shell } from "../components/Shell/Shell";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Affix, ActionIcon, Tooltip } from "@mantine/core";
import { TbWritingSign } from "react-icons/tb";
import { isLoggedIn } from "../hooks/useAuth";

export function BasePage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <Shell>
      <Outlet />
      {!pathname.includes("poems/add") && (
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
      )}
    </Shell>
  );
}
