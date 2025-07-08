import { Shell } from "../components/Shell/Shell";
import { Outlet } from "react-router";
import { ScrollArea } from "@mantine/core";

export function MePage() {
  return (
    <Shell profileNavbar fillBackground>
      <ScrollArea h="100%" pt={50}>
      <Outlet />
      </ScrollArea>
    </Shell>
  )
}