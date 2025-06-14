import { Group, Button, Text, ActionIcon, Tooltip } from "@mantine/core";
import { TbLogin, TbSearch, TbWritingSign } from "react-icons/tb";
import { searchHandlers } from "../Search";
import { useNavigate } from "react-router";
import { isLoggedIn } from "../../hooks/useAuth";
import { ProfileMenu } from "./ProfileMenu";

export function Header() {
  const navigate = useNavigate();
  return (
    <Group justify="space-between">
      <Button
        variant="default"
        w={350}
        ta="left"
        c="dimmed"
        radius="md"
        justify="space-between"
        onClick={searchHandlers.open}
      >
        <Group>
          <TbSearch size={16} />
          <Text size="sm">Buscar</Text>
        </Group>
      </Button>
      <Group>
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
          <Button
            radius="md"
            onClick={() => navigate("/login")}
            leftSection={<TbLogin />}
          >
            Iniciar sesión
          </Button>
        )}
      </Group>
    </Group>
  );
}
