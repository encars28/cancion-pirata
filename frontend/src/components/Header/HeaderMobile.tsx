import { Group, Button, Text } from "@mantine/core";
import { TbLogin, TbSearch } from "react-icons/tb";
import { searchHandlers } from "../Search";
import { useNavigate } from "react-router";
import { isLoggedIn } from "../../hooks/useAuth";
import { ProfileMenu } from "./ProfileMenu";
import { ColorToggle } from "../ColorToggle/ColorScheme";

export function HeaderMobile() {
  const navigate = useNavigate();
  return (
    <Group w="100%" m={{base: "md", sm: "xl"}} wrap="nowrap" gap={10} justify="space-between">
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
          <Group>
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
