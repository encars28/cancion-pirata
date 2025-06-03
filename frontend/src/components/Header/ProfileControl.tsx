import {
  ActionIcon,
  Text,
  Avatar,
  Group,
  Menu,
  Tooltip,
  Center,
} from "@mantine/core";
import { useNavigate } from "react-router";
import useAuth, { isLoggedIn } from "../../hooks/useAuth";
import { TbChevronRight, TbLogout, TbSettings, TbUser, TbX } from "react-icons/tb";
import { modals } from "@mantine/modals";
import { handleSuccess } from "../../utils";

export function ProfileControl() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const openModal = () =>
    modals.openConfirmModal({
      title: "Por favor confirme su acción",
      children: <Text size="sm">¿Está seguro de que desea cerrar sesión?</Text>,
      onConfirm: () => {
        logout();
        handleSuccess();
      },
      confirmProps: { color: "red" },
      labels: { confirm: "Cerrar sesión", cancel: "Cancelar" },
    });

  return (
    <Menu shadow="lg" width={250} position="bottom" trigger="hover">
      <Menu.Target>
        <Avatar
          size={35}
          radius="xl"
          src="/src/assets/Cat03.jpg"
          alt="Perfil"
          onClick={() => navigate("/me")}
        />
      </Menu.Target>
      <Menu.Dropdown ta="left">
        <Text size="md" ta="center" m={10} fw="bold">
          {"¡Bienvenido, " + user?.username + "!"}
        </Text>
        <Center mb="md" mt="sm">
          <Avatar size={80} src="/src/assets/Cat03.jpg" alt="Perfil" />
        </Center>
        <Menu.Label>Usuario</Menu.Label>
        <Menu.Item
          onClick={() => navigate(`/users/${user?.id}`)}
          leftSection={<TbUser />}
        >
          Página usuario
        </Menu.Item>
        <Menu.Item
          onClick={() => navigate("/me")}
          leftSection={<TbSettings />}
        >
          Ajustes perfil
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item onClick={openModal} color="red" leftSection={<TbLogout />}>
          Cerrar sesión
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
