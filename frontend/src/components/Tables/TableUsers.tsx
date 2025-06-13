import { Stack, Group, Pagination } from "@mantine/core";
import { TableSort } from "../Tables/TableSort";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";
import { Loading } from "../Loading";
import { callService } from "../../utils";
import { UserPublic, usersReadUsers } from "../../client";
import { EditUser } from "../User/EditUser";
import { DeleteUser } from "../User/DeleteUser";
import { AddUser } from "../User/AddUser";
import { notifications } from "@mantine/notifications";
import { errorNotification } from "../../notifications";

const PER_PAGE = 6

function getUsersQueryOptions({ page }: { page: number }) {
  return {
    queryFn: async () =>
      callService(usersReadUsers, { query: { skip: (page - 1) * PER_PAGE, limit: PER_PAGE } }),
    queryKey: ["users", { page }],
  }
}

export function TableUsers() {
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
    notifications.show(errorNotification({
      title: "Error cargando usuarios",
      description: error.message
    }))
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
      actions: <Group gap="xs"><EditUser user={user} /><DeleteUser user_id={user.id} /></Group>
    }
  })

  return (
    <Stack m="xl">
      <Group
        justify="flex-end"
        mb="xl"
        mr={{ base: 0, lg: "lg" }}
      >
        <AddUser />
      </Group>
      <Stack
        align="center"
        gap="xl"
        mr={{ base: 0, lg: "lg" }}
        ml={{ base: 0, lg: "lg" }}
      >
        <TableSort
          headers={userHeaders}
          data={userData}
          miw={960}
        />
        <Pagination
          mb="xl"
          mt="md"
          siblings={3}
          total={count % PER_PAGE === 0 ? count / PER_PAGE : Math.floor(count / PER_PAGE) + 1}
          onChange={(page) => setPage(page)}
          disabled={count <= PER_PAGE}
        />
      </Stack>
    </Stack>
  )
}