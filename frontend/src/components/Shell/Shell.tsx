import {
  AppShell,
  Burger,
  Group,
  RemoveScroll,
  useMantineTheme,
} from "@mantine/core";
import classes from "./Shell.module.css";
import { useDisclosure } from "@mantine/hooks";
import { ProfileNavbar } from "../User/ProfileNavbar";
import { Navbar } from "../Navbar/Navbar";
import { Header } from "../Header/Header";
import { HeaderMobile } from "../Header/HeaderMobile";
import { useMediaQuery } from "@mantine/hooks";
import { Footer } from "../Footer/Footer";

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
  const [asideMobileOpened, { toggle: toggleAsideMobile }] = useDisclosure();
  const [asideDesktopOpened, { toggle: toggleAsideDesktop }] =
    useDisclosure(true);
  const navwidth = profileNavbar ? 400 : 0;
  const theme = useMantineTheme();
  const isMediumBreakpoint = useMediaQuery(
    `(max-width: ${theme.breakpoints.md})`
  );
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);
  const footerheight = isMobile ? 65 : 0;
  console.log(asideDesktopOpened, asideMobileOpened)
  return (
    <AppShell
      header={{ height: 60 }}
      aside={{
        width: navwidth,
        breakpoint: "md",
        collapsed: {
          mobile: !asideMobileOpened,
          desktop: !asideDesktopOpened,
        },
      }}
      navbar={{
        width: 70,
        breakpoint: "xs",
        collapsed: {
          mobile: true,
          desktop:
            profileNavbar && (isMediumBreakpoint ? asideMobileOpened : false),
        },
      }}
      footer={{
        height: footerheight,
      }}
    >
      <AppShell.Header
        style={{ border: 0 }}
        className={RemoveScroll.classNames.zeroRight}
      >
        <Group
          justify="flex-end"
          visibleFrom="md"
          w="100%"
          h="100%"
          wrap="nowrap"
          pr="xl"
        >
          <Header />
          {profileNavbar && (
            <>
              <Burger
                opened={asideMobileOpened}
                onClick={toggleAsideMobile}
                hiddenFrom="md"
                size="md"
              />
              <Burger
                opened={asideDesktopOpened}
                onClick={toggleAsideDesktop}
                visibleFrom="md"
                size="md"
              />
            </>
          )}
        </Group>
        <Group
          justify="flex-end"
          hiddenFrom="md"
          w="100%"
          h="100%"
          wrap="nowrap"
          pr="xl"
        >
          <HeaderMobile />
          {profileNavbar && (
            <>
              <Burger
                opened={asideMobileOpened}
                onClick={toggleAsideMobile}
                hiddenFrom="md"
                size="md"
              />
              <Burger
                opened={asideDesktopOpened}
                onClick={toggleAsideDesktop}
                visibleFrom="md"
                size="md"
              />
            </>
          )}
        </Group>
      </AppShell.Header>

      {profileNavbar && (
        <AppShell.Aside>
          <ProfileNavbar />
        </AppShell.Aside>
      )}

      <AppShell.Navbar p="sm">
        <Navbar />
      </AppShell.Navbar>

      {isMobile && (
        <AppShell.Footer>
          <Footer />
        </AppShell.Footer>
      )}

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
