import { Shell } from "../components/Shell/Shell";
import { Group } from "@mantine/core";
import { AddUser } from "../components/User/AddUser";
import { FloatingTabs } from "../components/FloatingTabs/FloatingTabs";
import { TableUsers } from "../components/Tables/TableUsers";
import { AddAuthor } from "../components/Author/AddAuthor";
import { useState } from "react";
import { TableAuthors } from "../components/Tables/TableAuthors";
import { TablePoems } from "../components/Tables/TablePoems";

export function AdminPage() {
  const [tab, setTab] = useState("usuarios");

  return (
    <Shell>
      <FloatingTabs
        grow
        data={{
          "usuarios": (
            <>
              <Group
                justify="flex-end"
                mb="xl"
                mr={{ base: 0, lg: "lg" }}
              >
                <AddUser />
              </Group>
              <TableUsers />
            </>
          ),
          "autores": (
            <>
              <Group
                justify="flex-end"
                mb="xl"
                mr={{ base: 0, lg: "lg" }}
              >
                <AddAuthor />
              </Group>
              <TableAuthors />
            </>
          ),
          "poemas": (
            <>
              <TablePoems />
            </>
          ),
        }}
      />
    </Shell >
  );
}