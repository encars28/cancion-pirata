import { Shell } from "../components/Shell/Shell";
import { Group } from "@mantine/core";
import { AddUser } from "../components/User/AddUser";
import { FloatingTabs } from "../components/FloatingTabs/FloatingTabs";
import { TableUsers } from "../components/Tables/TableUsers";
import { AddAuthor } from "../components/Author/AddAuthor";

export function AdminPage() {
  return (
    <Shell>
      <FloatingTabs
        grow
        data={{
          "Usuarios": (
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
          "Autores": (
            <>
              <Group
                justify="flex-end"
                mb="xl"
                mr={{ base: 0, lg: "lg" }}
              >
                <AddAuthor />
              </Group>
              <TableUsers />
            </>
          ),
          "Poemas": (
            <>
              <Group
                justify="flex-end"
                mb="xl"
                mr={{ base: 0, lg: "lg" }}
              >
                <AddAuthor />
              </Group>
              <TableUsers />
            </>
          ),
        }}
      />
    </Shell >
  );
}