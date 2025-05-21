import { ActionIcon, Text, Avatar, Group, Menu, Tooltip, Center } from "@mantine/core";
import { useNavigate } from "react-router";
import useAuth, { isLoggedIn } from "../../hooks/useAuth";
import { TbChevronRight, TbLogout, TbUser, TbX } from "react-icons/tb";
import { useState } from "react";
import { modals } from "@mantine/modals"
import { handleSuccess } from "../../utils";

export function ProfileControl() {
  const navigate = useNavigate()
  const [opened, setOpened] = useState(false);
  const { user, logout } = useAuth()

  const openModal = () => modals.openConfirmModal({
    title: 'Por favor confirme su acción',
    children: (
      <Text size="sm" ta="left">
        ¿Está seguro de que desea cerrar sesión?
      </Text>
    ),
    onConfirm: () => {logout(); handleSuccess()},
    confirmProps: { color: 'red' },
    labels: { confirm: 'Cerrar sesión', cancel: 'Cancelar' },
  });

  return (
    <Menu
      shadow="lg"
      width={250}
      offset={30}
      position="bottom-end"
      opened={opened}
      onChange={setOpened}
    >
      <Menu.Target>
        <Tooltip
          label={isLoggedIn() ? "Perfil" : "Login"}
          offset={0}
        >
          <Avatar size={35} radius="xl" src="/src/assets/Cat03.jpg" alt="Perfil" />
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown ta='left'>
        <Group justify="flex-end" m={4}>
          <ActionIcon
            variant="subtle"
            color="gray"
            radius="md"
            onClick={() => setOpened(false)}
          >
            <TbX size={15} />
          </ActionIcon>
        </Group>
        <Text size="md" ta="center" m={10} fw="bold" style={{ wordWrap: "break-word" }}>
          {"¡Bienvenido, " + user?.username + "!"}
        </Text>
        <Center mb="md" mt="sm">
          <Avatar size={80} src="/src/assets/Cat03.jpg" alt="Perfil" />
        </Center>
        <Menu.Label>Usuario</Menu.Label>
        <Menu.Item
          onClick={() => navigate("/me")}
          leftSection={<TbUser />}
          rightSection={<TbChevronRight />}
        >
          Mi perfil
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          onClick={openModal}
          color="red"
          leftSection={<TbLogout />}

        >
          Cerrar sesión
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}