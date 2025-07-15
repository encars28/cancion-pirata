import { Space, Affix, ActionIcon, Tooltip } from "@mantine/core";
import { AdminTabs } from "../components/AdminTabs/AdminTabs";
import { Shell } from "../components/Shell/Shell";
import { Outlet } from "react-router";
import { TbWritingSign } from "react-icons/tb";
import { isLoggedIn } from "../hooks/useAuth";
import { useNavigate } from "react-router";

export function AdminPage() {
  const navigate = useNavigate();
  return (
    <Shell noPaddingTop>
      <Space h="md" />
      <AdminTabs tabsDefault="usuarios"/>
      <Outlet />
      <Space h={120} />
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
    </Shell >
  );
}