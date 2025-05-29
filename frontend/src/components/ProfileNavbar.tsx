import {
  AppShell,
  Avatar,
  Button,
  Container,
  NavLink,
  Stack,
  Text,
} from "@mantine/core";
import {
  TbChevronRight,
  TbLock,
  TbSettings,
  TbTrash,
  TbUser,
} from "react-icons/tb";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import useAuth from "../hooks/useAuth";
import { modals } from "@mantine/modals";
import useUserActions from "../hooks/useUserActions";

export function ProfileNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(
    location.pathname.split("me/")[1] ?? "profile"
  );
  const { logout, user: currentUser } = useAuth();
  const { deleteUserMeMutation } = useUserActions();

  const deleteMe = () =>
    modals.openConfirmModal({
      title: "Por favor confirme su acción",
      children: (
        <Text size="sm" ta="left">
          ¿Está seguro de que desea borrar este elemento? La acción es
          irreversible
        </Text>
      ),
      onConfirm: async () => deleteUserMeMutation.mutateAsync(),
      confirmProps: { color: "red" },
      labels: { confirm: "Eliminar", cancel: "Cancelar" },
    });

  return (
    <AppShell.Navbar>
      <AppShell.Section mt="md" px="lg">
        <Stack align="center" gap="xs" my="xl">
          <Avatar src="/src/assets/Cat03.jpg" name="Usuario" size={120} />
        </Stack>
      </AppShell.Section>
      {currentUser?.author_id && (
        <AppShell.Section px="lg" my="md">
          <Button
            onClick={() => navigate(`/authors/${currentUser.author_id}`)}
            mb="sm"
            variant="default"
            fullWidth
          >
            Ir a página de autor
          </Button>
        </AppShell.Section>
      )}
      <AppShell.Section grow>
        <Container p={0} w="100%" mt="sm">
          <Text ta="left" mb="sm" px="lg" size="sm" c="dimmed">
            Ajustes de la página
          </Text>
          <NavLink
            px="lg"
            label="Configuración de la página"
            leftSection={<TbSettings size={16} />}
            rightSection={
              <TbChevronRight size={12} className="mantine-rotate-rtl" />
            }
            onClick={() => {
              setActive("settings");
              navigate("/me/settings");
            }}
            active={active === "settings"}
          />
        </Container>
        <Container p={0} w="100%" mt="xl">
          <Text ta="left" mb="sm" px="lg" size="sm" c="dimmed">
            Ajustes de usuario
          </Text>
          <NavLink
            px="lg"
            label="Datos usuario"
            leftSection={<TbUser size={16} />}
            rightSection={
              <TbChevronRight size={12} className="mantine-rotate-rtl" />
            }
            onClick={() => {
              setActive("profile");
              navigate("/me/profile");
            }}
            active={active === "profile"}
          />
          <NavLink
            px="lg"
            label="Cambiar contraseña"
            leftSection={<TbLock size={16} />}
            rightSection={
              <TbChevronRight size={12} className="mantine-rotate-rtl" />
            }
            onClick={() => {
              setActive("password");
              navigate("/me/password");
            }}
            active={active === "password"}
          />
          <NavLink
            px="lg"
            label="Eliminar cuenta"
            leftSection={<TbTrash size={16} />}
            rightSection={
              <TbChevronRight size={12} className="mantine-rotate-rtl" />
            }
            onClick={deleteMe}
            color="red"
            active
            variant="subtle"
          />
        </Container>
      </AppShell.Section>
      <AppShell.Section px="lg" py="xl">
        <Button onClick={() => logout()} mb="sm" color="red" fullWidth>
          Logout
        </Button>
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
