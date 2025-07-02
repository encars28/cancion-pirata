import { Group, Title, Button, Text, ActionIcon, Tooltip } from "@mantine/core";
import { TbLogin, TbSearch, TbWritingSign } from "react-icons/tb";
import { searchHandlers } from "../Search";
import { useNavigate } from "react-router";
import { isLoggedIn } from "../../hooks/useAuth";
import { ProfileMenu } from "./ProfileMenu";

export function Header() {
  const navigate = useNavigate();
  return (
    <Group w="100%" wrap="nowrap" gap={40}>
      <Title
        c="dimmed"
        fw="lighter"
        textWrap="nowrap"
        ml="xl"
        order={3}
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
        ta="center"
      >
        La canción del poeta
      </Title>
      <Button
        variant="default"
        fullWidth
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
      <Group wrap="nowrap" mr="xl">
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
