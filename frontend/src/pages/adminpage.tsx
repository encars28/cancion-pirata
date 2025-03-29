import { useQuery } from "@tanstack/react-query";
import { Shell } from "../components/Shell/Shell";
import { callService, handleError } from "../utils";
import { UserPublic, usersReadUsers } from "../client";
import { Loading } from "../components/Loading";
import { TableSort } from "../components/Tables/TableSort";
import {
  Group, Pagination, Stack
} from "@mantine/core";
import { AddUser } from "../components/User/AddUser";
import { EditUser } from "../components/User/EditUser";
import { DeleteUser } from "../components/User/DeleteUser";
import { useNavigate, useSearchParams } from "react-router";

const PER_PAGE = 15

function getUsersQueryOptions({ page }: { page: number }) {
  return {
    queryFn: async () =>
      callService(usersReadUsers, { query: { skip: (page - 1) * PER_PAGE, limit: PER_PAGE } }),
    queryKey: ["users", { page }],
  }
}

export function AdminPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1

  const setPage = (page: number) => navigate({ search: `?page=${page}` })

  const { isPending, isError, data, error } = useQuery({
    ...getUsersQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  if (isPending) {
    return (<Loading />)
  }

  if (isError) {
    handleError(error as any);
  }

  const users: UserPublic[] = data?.data.slice(0, PER_PAGE) ?? []
  const count = data?.count ?? 0

  const userHeaders = {
    username: 'Usuario',
    email: 'Email',
    full_name: 'Nombre',
    is_superuser: 'Rol',
    created_at: 'Creación',
    is_author: 'Autor',
    is_active: 'Estado',
    actions: 'Acciones'
  }

  const userData = users.map((user) => {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name ?? '',
      is_superuser: user.is_superuser ? 'Admin' : 'Usuario',
      created_at: user.created_at?.toLocaleDateString() ?? '',
      is_author: user.author_id ? 'Sí' : 'No',
      is_active: user.is_active ? "Activo" : "Inactivo",
      actions: <Group gap="xs"><EditUser user={user} /><DeleteUser user_id={user.id} /></Group>
    }
  })

  return (
    <Shell>
      <Group
        justify="flex-end"
        mt="xl"
        mb="md"
        mr={{ base: "xl", sm: 60 }}
      >
        <AddUser />
      </Group>
      <Stack
        align="center"
        mr={{ base: "xl", lg: 60 }}
        ml={{ base: "xl", lg: 60 }}
        mt="xl"
        mb="xl"
        gap="xl"
      >
        <TableSort 
          headers={userHeaders} 
          data={userData} 
          miw={960}
        />
        <Pagination 
          style={{bottom: 60, position: "fixed"}}
          siblings={3} 
          total={count / PER_PAGE} 
          onChange={(page) => setPage(page)}
          disabled={count <= PER_PAGE}
        />
      </Stack>
    </Shell>
  );
}