import { TbChevronRight, TbLock, TbUser } from "react-icons/tb";
import { Profile } from "../components/Profile";
import { Shell } from "../components/Shell/Shell";
import { Group, NavLink, Stack } from "@mantine/core";
import { useState } from "react";

export function MePage() {
  const [active, setActive] = useState("data")
  
  let element: React.ReactNode | null
  switch(active) {
    case "data":
      element = <Profile />
      break
    case "password":
      element = <div>Cambiar contraseña</div>
      break
    default:
      element = null
  }

  return (
    <Shell>
      <Group>
        <Stack>
          <NavLink
            label="Datos usuario"
            leftSection={<TbUser size={16} />}
            rightSection={
              <TbChevronRight size={12} className="mantine-rotate-rtl" />
            }
            onClick={() => setActive('data')}
            active={active === 'data'}
          />
          <NavLink
            label="Cambiar contraseña"
            leftSection={<TbLock size={16} />}
            rightSection={
              <TbChevronRight size={12} className="mantine-rotate-rtl" />
            }
            onClick={() => setActive('password')}
            active={active === 'password'}
          />
        </Stack>
        {element}
      </Group>
    </Shell>
  )
}