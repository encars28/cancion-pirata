import classes from "./Navbar.module.css";
import { Tooltip, UnstyledButton, Stack } from "@mantine/core";
import { IconType } from "react-icons/lib";
import { useEffect, useState } from "react";
import {
  TbArrowsShuffle,
  TbBook,
  TbBookmarks,
  TbHelp,
  TbHome,
  TbSettings,
  TbUsersGroup,
} from "react-icons/tb";
import { useLocation, useNavigate } from "react-router";
import useAuth, { isLoggedIn } from "../../hooks/useAuth";
import { notifications } from "@mantine/notifications";
import { useQuery } from "@tanstack/react-query";
import { callService } from "../../utils";
import { poemsReadRandomPoem } from "../../client";

interface NavbarLinkProps {
  icon: IconType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton
        onClick={onClick}
        className={classes.link}
        data-active={active || undefined}
      >
        <Icon size={22} />
      </UnstyledButton>
    </Tooltip>
  );
}

export function Navbar() {
  const { pathname } = useLocation();
  const [active, setActive] = useState("");

  const { data: randomPoem } = useQuery({
    queryKey: ["randomPoem"],
    queryFn: async () => callService(poemsReadRandomPoem),
  })

  useEffect(() => {
    if (pathname === "/" || pathname === "") {
      setActive("main_page");
    } else if (pathname.startsWith("/poems")) {
      setActive("explore_poems");
    } else if (
      pathname.startsWith("/authors") ||
      pathname.startsWith("/author")
    ) {
      setActive("explore_authors");
    } else if (pathname.startsWith("/collections")) {
      setActive("collections");
    } else if (pathname.startsWith("/help")) {
      setActive("help");
    } else if (pathname.startsWith("/me")) {
      setActive("settings");
    }
  }, [pathname]);

  const navigate = useNavigate();
  const { user } = useAuth();
  const handleCollectionsClick = () => {
    if (isLoggedIn()) {
      navigate(`/users/${user?.id}`);
    } else {
      notifications.show({
        title: "Acción no permitida",
        message: "Debes iniciar sesión para acceder a las colecciones.",
      });
    }
  };

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Stack justify="center" align="center" gap={0}>
          <NavbarLink
            icon={TbHome}
            label="Página principal"
            active={active === "main_page"}
            onClick={() => {
              setActive("main_page");
              navigate("/");
            }}
          />
          <NavbarLink
            icon={TbBook}
            label="Explorar poemas"
            active={active === "explore_poems"}
            onClick={() => {
              setActive("explore_poems");
              navigate("/poems");
            }}
          />
          <NavbarLink
            icon={TbUsersGroup}
            label="Explorar autores y usuarios"
            active={active === "explore_authors"}
            onClick={() => {
              setActive("explore_authors");
              navigate("/authors");
            }}
          />
          <NavbarLink
            icon={TbBookmarks}
            label="Colecciones"
            active={active === "collections"}
            onClick={handleCollectionsClick}
          />
          <NavbarLink
            icon={TbArrowsShuffle}
            label="Poema aleatorio"
            onClick={() => {
              randomPoem ? navigate(`/poems/${randomPoem.id}`) : null;
            }}
          />
        </Stack>
      </div>
      {isLoggedIn() && (
        <Stack justify="center" align="center" gap={0} mb={20}>
          <NavbarLink
            icon={TbSettings}
            label="Configuración"
            active={active === "settings"}
            onClick={() => {
              setActive("settings");
              navigate("/me");
            }}
          />
          <NavbarLink
            icon={TbHelp}
            label="Ayuda para escritorse"
            active={active === "help"}
            onClick={() => {
              setActive("help");
              navigate("/help");
            }}
          />
        </Stack>
      )}
    </nav>
  );
}
