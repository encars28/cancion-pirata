import { Group, Title, Button, Text } from "@mantine/core";
import { TbLogin, TbSearch } from "react-icons/tb";
import { searchHandlers } from "../Search";
import { useNavigate } from "react-router";
import { isLoggedIn } from "../../hooks/useAuth";
import { ProfileMenu } from "./ProfileMenu";
import { ColorToggle } from "../ColorToggle/ColorScheme";

export function Header() {
  const navigate = useNavigate();
  return (
    <Group w="100%" m="xl" wrap="nowrap" gap={10} justify="space-between">
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
      <Group wrap="nowrap" w="100%" justify="flex-end">
        <ColorToggle />
        <Button
          variant="default"
          fullWidth
          ta="left"
          c="dimmed"
          maw={300}
          mr={{ base: 0, lg: "lg" }}
          radius="md"
          justify="space-between"
          onClick={searchHandlers.open}
        >
          <Group visibleFrom="xs">
            <TbSearch size={16} />
            <Text size="sm">Buscar</Text>
          </Group>
        </Button>
        <Group wrap="nowrap">
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
    </Group>
  );
}
