import {
  Text,
  Menu,
  Center,
} from "@mantine/core";
import { useNavigate } from "react-router";
import useAuth from "../../hooks/useAuth";
import {
  TbLogout,
  TbSettings,
  TbUser,
} from "react-icons/tb";
import { modals } from "@mantine/modals";
import { ProfileAvatar } from "../User/ProfileAvatar";

export function ProfileMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const openModal = () =>
    modals.openConfirmModal({
      title: "Por favor confirme su acción",
      children: <Text size="sm">¿Está seguro de que desea cerrar sesión?</Text>,
      onConfirm: () => {
        logout();
      },
      confirmProps: { color: "red" },
      labels: { confirm: "Cerrar sesión", cancel: "Cancelar" },
    });

  return (
    <Menu shadow="lg" width={250} position="bottom" trigger="hover">
      <Menu.Target>
        <ProfileAvatar size={35} style={{cursor: "pointer"}} onClick={() => navigate(`/users/${user?.id}`)} />
      </Menu.Target>
      <Menu.Dropdown ta="left">
        <Text size="md" ta="center" m={10} fw="bold">
          {"¡Bienvenido, " + user?.username + "!"}
        </Text>
        <Center mb="md" mt="sm">
          <ProfileAvatar size={70} />
        </Center>
        <Menu.Label>Usuario</Menu.Label>
        <Menu.Item
          onClick={() => navigate(`/users/${user?.id}`)}
          leftSection={<TbUser />}
        >
          Página usuario
        </Menu.Item>
        <Menu.Item onClick={() => navigate("/me")} leftSection={<TbSettings />}>
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
