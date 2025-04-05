import { AppShell, Burger, NavLink, Container, Group, RemoveScroll, Button, UnstyledButton, Stack, Avatar, Title } from '@mantine/core';
import { SearchControl } from '../Header/Search/SearchControl/SearchControl';
import { useLocation, useNavigate } from 'react-router';
import { TbUser, TbChevronRight, TbLock, TbLogin, TbSettings } from "react-icons/tb";
import classes from './Shell.module.css';
import { SearchControlMobile } from '../Header/Search/SearchControlMobile/SearchControlMobile';
import { LoginControl } from '../Header/LoginControl/LoginControl';
import { isLoggedIn } from '../../hooks/useAuth';
import useAuth from '../../hooks/useAuth';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { ProfileControl } from '../Header/ProfileControl';

interface ShellProps {
  children: React.ReactNode;
  navbar?: boolean
}

export function Shell({ children, navbar }: ShellProps) {
  const navigate = useNavigate();
  const location = useLocation()
  const [active, setActive] = useState(location.pathname.split('me/')[1] ?? 'profile');
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const { logout } = useAuth();
  const navwidth = navbar ? 300 : 0;
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: navwidth,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      >

      <AppShell.Header className={RemoveScroll.classNames.zeroRight}>
        <Container size="xl" px="md" className={classes.inner}>
          <Group px="xl">
            {navbar && (
              <>
                <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
                <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
              </>
            )}
            <UnstyledButton onClick={() => navigate("/")} className={classes.link}>
              Tremendo Logo
            </UnstyledButton>
          </Group>


          <Group visibleFrom="sm" gap="xl">
            <SearchControl />
            {isLoggedIn() ? <ProfileControl /> : <Button radius="md" leftSection={<TbLogin />}>Iniciar sesión</Button> }
          </Group>

          <Group hiddenFrom="sm" gap="md">
            <SearchControlMobile />
            {isLoggedIn() ? <ProfileControl /> : <LoginControl />}
          </Group>
        </Container>
      </AppShell.Header>
      {navbar && (
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
      )}
      <AppShell.Main>
        <div className={classes.main}>{children}</div>
      </AppShell.Main>
    </AppShell>
  );
}