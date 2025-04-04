import { ActionIcon, Text, Avatar, Group, Menu, Tooltip, Container, Flex, Title, Center } from "@mantine/core";
import { useNavigate } from "react-router";
import useAuth, { isLoggedIn } from "../../hooks/useAuth";
import { TbChevronRight, TbLogin, TbLogout, TbUser, TbX } from "react-icons/tb";
import { useState } from "react";

export function ProfileControl() {
  const navigate = useNavigate()
  const [opened, setOpened] = useState(false);
  const { user } = useAuth()

  const avatar = (size: number) => {
    if (isLoggedIn())
      return (
        <Avatar size={size} radius="xl" src="/src/assets/Cat03.jpg" alt="Perfil" />
      )

    return (
      <Avatar size={size} radius="xl" alt="Login">
        <TbUser />
      </Avatar>
    )
  }

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
          {avatar(35)}
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
          {isLoggedIn() ? "¡Bienvenido, " + user?.username + "!" : "¡Bienvenido!"}
        </Text>
        <Center mb="md" mt="sm">
          {avatar(80)}
        </Center>
        <Menu.Label>Usuario</Menu.Label>
        <Menu.Item
          onClick={() => { isLoggedIn() ? navigate("/me") : navigate("/login") }}
          leftSection={isLoggedIn() ? <TbUser /> : <TbLogin />}
          rightSection={<TbChevronRight />}
        >
          {isLoggedIn() ? "Perfil" : "Login"}
        </Menu.Item>
        {isLoggedIn() && (
          <>
            <Menu.Divider />
            <Menu.Item
              onClick={() => navigate("/logout")}
              color="red"
              leftSection={<TbLogout />}

            >
              Cerrar sesión
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  )
}