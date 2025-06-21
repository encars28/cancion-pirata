import {
  AppShell,
  Button,
  Container,
  NavLink,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import {
  TbAt,
  TbLock,
  TbLogout,
  TbSettings,
  TbTrash,
  TbUser,
} from "react-icons/tb";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import useAuth from "../../hooks/useAuth";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { successNotification } from "../../notifications";
import useUserMe from "../../hooks/useUserMe";
import { UploadPicture } from "../PersonPicture/UploadPicture/UploadPicture";

export function ProfileNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(
    location.pathname.split("me/")[1] ?? "profile"
  );
  const { logout, user: currentUser } = useAuth();
  const { deleteUserMeMutation, updateProfilePicture } = useUserMe();
  const pictureUrl = import.meta.env.VITE_IMAGES_DIR + "/users/" + currentUser?.id + ".png"

  const deleteMe = () =>
    modals.openConfirmModal({
      title: "Por favor confirme su acción",
      children: (
        <Text size="sm">
          ¿Está seguro de que desea borrar este elemento? La acción es
          irreversible
        </Text>
      ),
      onConfirm: async () => deleteUserMeMutation.mutateAsync(),
      confirmProps: { color: "red" },
      labels: { confirm: "Eliminar", cancel: "Cancelar" },
    });

  const logoutModal = () =>
    modals.openConfirmModal({
      title: "Cerrar sesión",
      children: <Text size="sm">¿Está seguro de que desea cerrar sesión?</Text>,
      onConfirm: () => {
        logout();
        notifications.show(successNotification({title: "Sesión cerrada", description: "La sesión se ha cerrado correctamente."}));
      },
      confirmProps: { color: "red" },
      labels: { confirm: "Cerrar sesión", cancel: "Cancelar" },
    });

  return (
    <AppShell.Aside>
      <ScrollArea>
      <AppShell.Section mt="md" px="xl">
        <Stack align="center" gap="xs" my="xl">
          <UploadPicture url={pictureUrl} updatePicture={updateProfilePicture}/>
        </Stack>
      </AppShell.Section>
      <AppShell.Section px="xl" my="md">
        <Button
          onClick={() => navigate(`/users/${currentUser?.id}`)}
          mb="sm"
          variant="default"
          fullWidth
        >
          Ver página de usuario
        </Button>
      </AppShell.Section>
      <AppShell.Section grow>
        <Container p={0} w="100%" mt="sm">
          <Text mb="sm" px="lg" size="sm" c="dimmed">
            Ajustes de la página
          </Text>
          <NavLink
            px="xl"
            label="Configuración de la página"
            leftSection={<TbSettings size={16} />}
            onClick={() => {
              setActive("settings");
              navigate("/me/settings");
            }}
            active={active === "settings"}
          />
        </Container>
        <Container p={0} w="100%" mt="xl">
          <Text mb="sm" px="lg" size="sm" c="dimmed">
            Ajustes de usuario
          </Text>
          <NavLink
            px="xl"
            label="Datos"
            leftSection={<TbUser size={16} />}
            onClick={() => {
              setActive("profile");
              navigate("/me/profile");
            }}
            active={active === "profile"}
          />
          <NavLink
            px="xl"
            label="Cambiar contraseña"
            leftSection={<TbLock size={16} />}
            onClick={() => {
              setActive("password");
              navigate("/me/password");
            }}
            active={active === "password"}
          />
          <NavLink
            px="xl"
            label="Cambiar email"
            leftSection={<TbAt size={16} />}
            onClick={() => {
              setActive("email");
              navigate("/me/email");
            }}
            active={active === "email"}
          />
          <NavLink
            px="xl"
            label="Eliminar cuenta"
            leftSection={<TbTrash size={16} />}
            onClick={deleteMe}
            color="red"
            active
            variant="subtle"
          />
        </Container>
      </AppShell.Section>
      <AppShell.Section px="lg" py="xl">
        <Button
          leftSection={<TbLogout />}
          onClick={logoutModal}
          mb="sm"
          color="red"
          fullWidth
        >
          Cerrar sesión
        </Button>
      </AppShell.Section>
      </ScrollArea>
    </AppShell.Aside>
  );
}
