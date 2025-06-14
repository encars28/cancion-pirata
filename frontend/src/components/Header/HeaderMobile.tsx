import { Group, ActionIcon, Tooltip } from "@mantine/core";
import { TbSearch, TbUser } from "react-icons/tb";
import { searchHandlers } from "../Search";
import { TbWritingSign } from "react-icons/tb";
import { useNavigate } from "react-router";
import { isLoggedIn } from "../../hooks/useAuth";
import { ProfileMenu } from "./ProfileMenu";

export function HeaderMobile() {
  const navigate = useNavigate();
  return (
    <Group>
      <Tooltip label="Buscar">
        <ActionIcon
          variant="default"
          size="lg"
          onClick={searchHandlers.open}
          c="dimmed"
          radius="md"
        >
          <TbSearch size={20} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Nuevo poema">
        <ActionIcon
          size={35}
          variant="light"
          radius="md"
          onClick={
            isLoggedIn()
              ? () => navigate("/poems/add")
              : () => navigate("/login")
          }
        >
          <TbWritingSign size={22} />
        </ActionIcon>
      </Tooltip>
      {isLoggedIn() ? (
        <ProfileMenu />
      ) : (
        <Tooltip label="Iniciar sesión">
          <ActionIcon
            variant="filled"
            size="lg"
            radius="md"
            onClick={() => navigate("/login")}
          >
            <TbUser size={22} />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
}
