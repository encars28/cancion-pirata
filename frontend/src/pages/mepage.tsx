import { TbChevronRight, TbLock, TbUser } from "react-icons/tb";
import { Shell } from "../components/Shell/Shell";
import { NavLink, Stack } from "@mantine/core";
import { Outlet, useNavigate } from "react-router";
import { useState } from "react";

export function MePage() {
  const navigate = useNavigate()
  const [active, setActive] = useState('profile')

  return (
    <Shell>
      <NavLink
        label="Datos usuario"
        leftSection={<TbUser size={16} />}
        rightSection={
          <TbChevronRight size={12} className="mantine-rotate-rtl" />
        }
        onClick={() => { setActive('profile'); navigate('/me/profile') }}
        active={active === 'profile'}
      />
      <NavLink
        label="Cambiar contraseña"
        leftSection={<TbLock size={16} />}
        rightSection={
          <TbChevronRight size={12} className="mantine-rotate-rtl" />
        }
        onClick={() => { setActive('password'); navigate('/me/password') }}
        active={active === 'password'}
      />
      <Outlet />
    </Shell>
  )
}