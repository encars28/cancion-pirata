import {
  AppShell,
  Burger,
  Container,
  Group,
  RemoveScroll,
} from "@mantine/core";
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
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const navwidth = profileNavbar ? 400 : 0;
  return (
    <AppShell
      header={{ height: 65 }}
      aside={{
        width: navwidth,
        breakpoint: "md",
        collapsed: {
          mobile: !mobileOpened,
          desktop: !desktopOpened,
        },
      }}
      navbar={{
        width: 70,
        breakpoint: "xs",
      }}
    >
      <AppShell.Header
        style={{ border: 0 }}
        className={RemoveScroll.classNames.zeroRight}
      >
        <Container size="xl" className={classes.inner}>
          <Group
            justify="space-between"
            visibleFrom={profileNavbar ? "lg" : "sm"}
            gap={60}
          >
            <Header />
            {profileNavbar && (
              <>
                <Burger
                  opened={mobileOpened}
                  onClick={toggleMobile}
                  hiddenFrom="md"
                  size="md"
                />
                <Burger
                  opened={desktopOpened}
                  onClick={toggleDesktop}
                  visibleFrom="md"
                  size="md"
                />
              </>
            )}
          </Group>

          <Group hiddenFrom={profileNavbar ? "lg" : "sm"} gap={40}>
            <HeaderMobile />
            {profileNavbar && (
              <>
                <Burger
                  opened={mobileOpened}
                  onClick={toggleMobile}
                  hiddenFrom="md"
                  size="md"
                />
                <Burger
                  opened={desktopOpened}
                  onClick={toggleDesktop}
                  visibleFrom="md"
                  size="md"
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
