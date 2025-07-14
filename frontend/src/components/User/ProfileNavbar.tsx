import {
  AppShell,
  Button,
  Container,
  NavLink,
  Stack,
  Text,
} from "@mantine/core";
import {
  TbAt,
  TbLock,
  TbLogout,
  TbSettings,
  TbTrash,
} from "react-icons/tb";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import useAuth from "../../hooks/useAuth";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { successNotification } from "../../notifications";
import useUserMe from "../../hooks/useUserMe";
import { UploadPicture } from "../PersonPicture/UploadPicture/UploadPicture";
import useUserActions from "../../hooks/useUserActions";
import usePicture from "../../hooks/usePicture";

export function ProfileNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(
    location.pathname.split("me/")[1] ?? "profile"
  );
  const { logout, user} = useAuth();
  const { deleteUserMeMutation } = useUserMe();
  const { updateUserProfilePicture: updateProfilePicture } = useUserActions(user?.id!);
  const { userProfilePicture: pictureUrl, setUserProfilePicture } = usePicture()
  
  useEffect(() => {
    setUserProfilePicture(import.meta.env.VITE_IMAGES_DIR + "/users/" + user?.id + ".png" + "?" + new Date().getTime());
  }, [user?.id]);

  const deleteMe = () =>
    modals.openConfirmModal({
      title: "Por favor confirme su acción",
      children: (
        <Text size="sm">
          ¿Está seguro de que deseas borrar tu cuenta? La acción es {" "}
          <b>irreversible</b>
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
      // <ScrollArea>
      <>
      <AppShell.Section mt="md" px="xl">
        <Stack align="center" gap="xs" my="xl">
          <UploadPicture url={pictureUrl} updatePicture={updateProfilePicture}/>
        </Stack>
      </AppShell.Section>
      <AppShell.Section grow>
        <Container p={0} w="100%" mt="xl">
          <Text mb="sm" px="lg" size="sm" c="dimmed">
            Ajustes de usuario
          </Text>
          <NavLink
            px="xl"
            label="Datos"
            leftSection={<TbSettings size={16} />}
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
      {/* </ScrollArea> */}
      </>
  );
}
