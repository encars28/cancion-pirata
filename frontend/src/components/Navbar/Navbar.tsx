import classes from "./Navbar.module.css";
import { Tooltip, UnstyledButton, Stack, Divider } from "@mantine/core";
import { IconType } from "react-icons/lib";
import { useEffect, useState } from "react";
import {
  TbArrowsShuffle,
  TbBookmarks,
  TbBrandSafari,
  TbHomeFilled,
  TbSettings,
  TbUserEdit,
} from "react-icons/tb";
import { useLocation, useNavigate } from "react-router";
import useAuth, { isLoggedIn } from "../../hooks/useAuth";
import { notifications } from "@mantine/notifications";
import { useQuery } from "@tanstack/react-query";
import { callService } from "../../utils";
import { poemsReadRandomPoem } from "../../client";
import { errorNotification } from "../../notifications";

interface NavbarLinkProps {
  icon: IconType;
  label: string;
  active?: boolean;
  border?: boolean;
  onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, active, onClick, border }: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton
        onClick={onClick}
        className={border? classes.link_border : classes.link}
        data-active={active || undefined}
      >
        <Icon size={24} />
      </UnstyledButton>
    </Tooltip>
  );
}

export function Navbar() {
  const { pathname } = useLocation();
  const [active, setActive] = useState("");

  const { data: randomPoem, refetch } = useQuery({
    queryKey: ["randomPoem"],
    queryFn: async () => callService(poemsReadRandomPoem),
    enabled: false,
  });

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
      navigate("/login");
      notifications.show(errorNotification({
        title: "Acción no permitida",
        description: "Debes iniciar sesión para acceder a las colecciones.",
      }));
    }
  };

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Stack gap="sm">
        <Stack justify="center" align="center">
        <NavbarLink
            icon={TbHomeFilled}
            label="Página principal"
            active={active === "main_page"}
            onClick={() => {
              setActive("main_page");
              navigate("/");
            }}
          />
        </Stack>
        <Stack justify="center" align="center" gap={10}>
                    <NavbarLink
            icon={TbUserEdit}
            label="Explorar autores y usuarios"
            active={active === "explore_authors"}
            onClick={() => {
              setActive("explore_authors");
              navigate("/authors");
            }}
          />
          <NavbarLink
            icon={TbBrandSafari}
            label="Explorar poemas"
            active={active === "explore_poems"}
            onClick={() => {
              setActive("explore_poems");
              navigate("/poems");
            }}
          />
          <NavbarLink
            icon={TbArrowsShuffle}
            label="Poema aleatorio"
            onClick={() => {
              refetch();
              randomPoem ? navigate(`/poems/${randomPoem.id}`) : null;
            }}
          />
          <NavbarLink
            icon={TbBookmarks}
            label="Colecciones"
            active={active === "collections"}
            onClick={handleCollectionsClick}
          />

        </Stack>
        </Stack>
      </div>
      {isLoggedIn() && (
        <Stack justify="center" align="center" gap={0}>
          <Divider size="sm" w={30} />
          <NavbarLink
            icon={TbSettings}
            label="Configuración"
            active={active === "settings"}
            onClick={() => {
              setActive("settings");
              navigate("/me");
            }}
          />
        </Stack>
      )}
    </nav>
  );
}
