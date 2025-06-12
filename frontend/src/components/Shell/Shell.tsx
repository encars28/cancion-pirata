import {
  AppShell,
  Burger,
  Container,
  Group,
  RemoveScroll,
  Button,
  UnstyledButton,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import { SearchControl } from "../Header/Search/SearchControl/SearchControl";
import { useNavigate } from "react-router";
import { TbBook, TbLogin, TbWritingSign } from "react-icons/tb";
import classes from "./Shell.module.css";
import { SearchControlMobile } from "../Header/Search/SearchControlMobile/SearchControlMobile";
import { LoginControl } from "../Header/LoginControl/LoginControl";
import { isLoggedIn } from "../../hooks/useAuth";
import { useDisclosure } from "@mantine/hooks";
import { ProfileControl } from "../Header/ProfileControl";
import { ProfileNavbar } from "../User/ProfileNavbar";
import { Navbar } from "../Navbar/Navbar";

interface ShellProps {
  children: React.ReactNode;
  profileNavbar?: boolean;
  fillBackground?: boolean;
  noPaddingTop?: boolean
}

export function Shell({ children, profileNavbar, fillBackground, noPaddingTop }: ShellProps) {
  const navigate = useNavigate();
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const navwidth = profileNavbar ? 400 : 0;
  return (
    <AppShell
      header={{ height: 60 }}
      aside={{
        width: navwidth,
        breakpoint: "sm",
        collapsed: {
          mobile: !mobileOpened,
          desktop: !desktopOpened,
        },
      }}
      navbar={{ width: 70, breakpoint: "xs" }}
    >
      <AppShell.Header className={RemoveScroll.classNames.zeroRight}>
        <Container size="xl" className={classes.inner}>
          <UnstyledButton
            onClick={() => navigate("/")}
            className={classes.link}
          >
            Tremendo Logo
          </UnstyledButton>
          <Group justify="space-between" gap={60}>
            <Group visibleFrom="sm">
              <SearchControl />
              {isLoggedIn() ? (
                <ProfileControl />
              ) : (
                <Button
                  radius="md"
                  onClick={() => navigate("/login")}
                  leftSection={<TbLogin />}
                >
                  Iniciar sesión
                </Button>
              )}
              <Tooltip label="Nuevo poema">
                <ActionIcon
                  size={35}
                  variant="light"
                  radius="md"
                  onClick={
                    isLoggedIn()
                      ? () => navigate("/poems/add")
                      : () => navigate("/login")
                  }
                >
                  {/* <Image src="/src/assets/poempen.png" alt="Nuevo poema" color="blue" /> */}
                  <TbWritingSign size={22} />
                </ActionIcon>
              </Tooltip>
            </Group>

            {profileNavbar && (
              <>
                <Burger
                  opened={mobileOpened}
                  onClick={toggleMobile}
                  hiddenFrom="sm"
                  size="sm"
                />
                <Burger
                  opened={desktopOpened}
                  onClick={toggleDesktop}
                  visibleFrom="sm"
                  size="sm"
                />
              </>
            )}
          </Group>

          <Group hiddenFrom="sm" gap="md">
            <SearchControlMobile />
            {isLoggedIn() ? <ProfileControl /> : <LoginControl />}
            <Tooltip label="Nuevo poema">
              <ActionIcon
                size={35}
                variant="light"
                radius="md"
                onClick={
                  isLoggedIn()
                    ? () => navigate("/poems/add")
                    : () => navigate("/login")
                }
              >
                {/* <Image src="/src/assets/poempen.png" alt="Nuevo poema" color="blue" /> */}
                <TbWritingSign size={22} />
              </ActionIcon>
            </Tooltip>
            {profileNavbar && (
              <>
                <Burger
                  opened={mobileOpened}
                  onClick={toggleMobile}
                  hiddenFrom="sm"
                  size="sm"
                />
                <Burger
                  opened={desktopOpened}
                  onClick={toggleDesktop}
                  visibleFrom="sm"
                  size="sm"
                />
              </>
            )}
          </Group>
        </Container>
      </AppShell.Header>

      {profileNavbar && <ProfileNavbar />}

      <AppShell.Navbar p="sm">
        <Navbar />
      </AppShell.Navbar>

      <AppShell.Main h="calc(100vh - var(--app-shell-header-height) - var(--app-shell-padding) * 2)">
        <div className={fillBackground ? classes.main_filled : noPaddingTop ? classes.main_no_padding : classes.main}>
          {children}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
