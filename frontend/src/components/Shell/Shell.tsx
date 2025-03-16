import { AppShell, Container, Group, RemoveScroll, Button, UnstyledButton } from '@mantine/core';
import { SearchControl } from '../Header/Search/SearchControl/SearchControl';
import { useNavigate } from 'react-router';
import { TbUser } from "react-icons/tb";
import classes from './Shell.module.css';
import { SearchControlMobile } from '../Header/Search/SearchControlMobile/SearchControlMobile';
import { LoginControl } from '../Header/LoginControl/LoginControl';
import { isLoggedIn } from '../../hooks/useAuth';
import useAuth from '../../hooks/useAuth';

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  return (
    <AppShell header={{ height: 60 }}>
      <AppShell.Header className={RemoveScroll.classNames.zeroRight}>
        <Container size="xl" px="md" className={classes.inner}>
          <UnstyledButton onClick={() => navigate("/")} className={classes.link}>
            Tremendo Logo
          </UnstyledButton>

          <Group visibleFrom="sm" gap="xl">
            <SearchControl />
            { isLoggedIn() ? (
              <Button
                size="xs"
                variant="filled"
                onClick={() => logout()}
              >Logout</Button>
            ) : (
              <Button
                size="xs"
                variant="filled"
                leftSection={<TbUser size={14} />}
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              )
            }
          </Group>

          <Group hiddenFrom="sm" gap="md">
            <SearchControlMobile />
            { !isLoggedIn() && <LoginControl /> }
          </Group>

        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <div className={classes.main}>{children}</div>
      </AppShell.Main>
    </AppShell>
  );
}