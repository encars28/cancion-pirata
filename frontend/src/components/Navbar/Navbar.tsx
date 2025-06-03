import classes from "./Navbar.module.css";
import { Tooltip, UnstyledButton, Stack, AppShell } from "@mantine/core";
import { IconType } from "react-icons/lib";
import { useState } from "react";
import {
  TbBook,
  TbBooks,
  TbFileSearch,
  TbListSearch,
  TbUser,
  TbUserSearch,
} from "react-icons/tb";
import { useNavigate } from "react-router";
import useAuth, { isLoggedIn } from "../../hooks/useAuth";

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
        <Icon size={20} />
      </UnstyledButton>
    </Tooltip>
  );
}

export function Navbar() {
  const [active, setActive] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      <AppShell.Section mt={100} grow>
        <Stack justify="center" align="center" gap={0}>
          <NavbarLink
            icon={TbListSearch}
            label="Explorar poemas"
            active={active === "explore_poems"}
            onClick={() => {
              setActive("explore_poems");
              navigate("/poems");
            }}
          />
          <NavbarLink
            icon={TbUserSearch}
            label="Explorar autores"
            active={active === "explore_authors"}
            onClick={() => {
              setActive("explore_authors");
              navigate("/authors");
            }}
          />
        </Stack>
      </AppShell.Section>
      {isLoggedIn() && (
        <AppShell.Section mb={100}>
          <Stack justify="center" align="center" gap={0}>
            <NavbarLink
              icon={TbBook}
              label="Mis poemas"
              active={active === "poems"}
              onClick={() => {
                setActive("poems");
                navigate(`/users/${user?.id}`);
              }}
            />
            <NavbarLink
              icon={TbBooks}
              label="Mis colecciones"
              active={active === "collections"}
              onClick={() => {
                setActive("collections");
                navigate(`/users/${user?.id}`);
              }}
            />
            <NavbarLink
              icon={TbUser}
              label="Mi usuario"
              active={active === "userpage"}
              onClick={() => {
                setActive("userpage");
                navigate(`/users/${user?.id}`);
              }}
            />
          </Stack>
        </AppShell.Section>
      )}
    </>
  );
}
