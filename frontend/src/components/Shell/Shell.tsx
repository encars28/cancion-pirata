import {
  AppShell,
  Burger,
  Container,
  Group,
  RemoveScroll,
  UnstyledButton,
} from "@mantine/core";
import { useNavigate } from "react-router";
import classes from "./Shell.module.css";
import { useDisclosure } from "@mantine/hooks";
import { ProfileNavbar } from "../User/ProfileNavbar";
import { Navbar } from "../Navbar/Navbar";
import { Header } from "../Header/Header";
import { HeaderMobile } from "../Header/HeaderMobile";

interface ShellProps {
  children: React.ReactNode;
  profileNavbar?: boolean;
  fillBackground?: boolean;
  noPaddingTop?: boolean;
}

export function Shell({
  children,
  profileNavbar,
  fillBackground,
  noPaddingTop,
}: ShellProps) {
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
      navbar={{
        width: 70,
        breakpoint: "xs",
        collapsed: {
          mobile: !mobileOpened,
          desktop: !desktopOpened,
        },
      }}
    >
      <AppShell.Header className={RemoveScroll.classNames.zeroRight}>
        <Container size="xl" className={classes.inner}>
          <UnstyledButton
            onClick={() => navigate("/")}
            className={classes.link}
          >
            Tremendo Logo
          </UnstyledButton>

          <Group justify="space-between" visibleFrom="sm" gap={60}>
            <Header />
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
            <HeaderMobile />
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
        <div
          className={
            fillBackground
              ? classes.main_filled
              : noPaddingTop
              ? classes.main_no_padding
              : classes.main
          }
        >
          {children}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
