import { AppShell, Avatar, Button, Container, NavLink, Stack } from '@mantine/core';
import { TbChevronRight, TbLock, TbSettings, TbUser } from "react-icons/tb";
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import useAuth from '../hooks/useAuth';

export function ProfileNavbar() {
  const navigate = useNavigate();
  const location = useLocation()
  const [active, setActive] = useState(location.pathname.split('me/')[1] ?? 'profile');
  const { logout } = useAuth();
  return (
    <AppShell.Navbar>
      <AppShell.Section mt="md" px="lg">
        <Stack
          align='center'
          gap="xs"
          my="xl"
        >
          <Avatar src="/src/assets/Cat03.jpg" name="Usuario" size={120} />
        </Stack>
      </AppShell.Section>
      <AppShell.Section grow>
        <Container p={0} w="100%" mt="sm">
          <NavLink
            px="lg"
            label="Datos usuario"
            leftSection={<TbUser size={16} />}
            rightSection={
              <TbChevronRight size={12} className="mantine-rotate-rtl" />
            }
            onClick={() => { setActive('profile'); navigate('/me/profile') }}
            active={active === 'profile'}
          />
          <NavLink
            px="lg"
            label="Cambiar contraseña"
            leftSection={<TbLock size={16} />}
            rightSection={
              <TbChevronRight size={12} className="mantine-rotate-rtl" />
            }
            onClick={() => { setActive('password'); navigate('/me/password') }}
            active={active === 'password'}
          />
          <NavLink
            px="lg"
            label="Configuración de la página"
            leftSection={<TbSettings size={16} />}
            rightSection={
              <TbChevronRight size={12} className="mantine-rotate-rtl" />
            }
            onClick={() => { setActive('settings'); navigate('/me/settings') }}
            active={active === 'settings'}
          />
        </Container>
      </AppShell.Section>
      <AppShell.Section px="lg" py="xl">
        <Button onClick={() => logout()} mb="sm" fullWidth>
          Logout
        </Button>
      </AppShell.Section>
    </AppShell.Navbar>
  )
}