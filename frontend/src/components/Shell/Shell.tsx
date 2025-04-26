import { AppShell, Burger, Container, Group, RemoveScroll, Button, UnstyledButton } from '@mantine/core';
import { SearchControl } from '../Header/Search/SearchControl/SearchControl';
import { useNavigate } from 'react-router';
import { TbLogin} from "react-icons/tb";
import classes from './Shell.module.css';
import { SearchControlMobile } from '../Header/Search/SearchControlMobile/SearchControlMobile';
import { LoginControl } from '../Header/LoginControl/LoginControl';
import { isLoggedIn } from '../../hooks/useAuth';
import { useDisclosure } from '@mantine/hooks';
import { ProfileControl } from '../Header/ProfileControl';
import { ProfileNavbar } from '../ProfileNavbar';

interface ShellProps {
  children: React.ReactNode;
  profileNavbar?: boolean
}

export function Shell({ children, profileNavbar }: ShellProps) {
  const navigate = useNavigate();
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const navwidth = profileNavbar ? 300 : 0;
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: navwidth,
        breakpoint: 'sm',
        collapsed: { 
          mobile: !mobileOpened, 
          desktop: !desktopOpened
      },
      }}
      >

      <AppShell.Header className={RemoveScroll.classNames.zeroRight}>
        <Container size="xl" px="md" className={classes.inner}>
          <Group px="xl">
            {profileNavbar && (
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

      {profileNavbar && (
        <ProfileNavbar />
      )}

      <AppShell.Main>
        <div className={classes.main}>{children}</div>
      </AppShell.Main>
    </AppShell>
  );
}