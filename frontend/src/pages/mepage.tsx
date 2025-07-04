import { Shell } from "../components/Shell/Shell";
import { Outlet, useLocation } from "react-router";
import { ScrollArea } from "@mantine/core";

export function MePage() {
  const { pathname } = useLocation()

  return (
    <Shell profileNavbar fillBackground={!pathname.includes("settings")}>
      <ScrollArea h="100%" pt={50}>
      <Outlet />
      </ScrollArea>
    </Shell>
  )
}