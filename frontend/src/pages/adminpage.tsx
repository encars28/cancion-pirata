import { useQuery } from "@tanstack/react-query";
import { Shell } from "../components/Shell/Shell";
import { callService, handleError } from "../utils";
import { UserPublic, usersReadUsers } from "../client";
import { Loading } from "../components/Loading";
import { TableSort } from "../components/Tables/TableSort";
import { Badge, Center, Container, Group } from "@mantine/core";
import { AddUser } from "../components/User/AddUser";
import { EditUser } from "../components/User/EditUser";
import { DeleteUser } from "../components/User/DeleteUser";

export function AdminPage() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => callService(usersReadUsers),
    placeholderData: (prevData) => prevData,
  })

  if (isPending) {
    return (<Loading />)
  }

  if (isError) {
    handleError(error as any);
  }

  const users: UserPublic[] = data?.data ?? []

  const userHeaders = {
    email: 'Email',
    full_name: 'Nombre',
    username: 'Usuario',
    is_superuser: 'Rol',
    created_at: 'Creación',
    author_id: 'ID autor',
    is_active: 'Estatus',
    actions: 'Acciones'
  }

  const userData = users.map((user) => {
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name ?? '',
      username: user.username,
      is_superuser: user.is_superuser ? 'Administrador' : 'Usuario',
      created_at: user.created_at?.toLocaleDateString() ?? '',
      author_id: user.author_id ?? '',
      is_active: user.is_active ? "Activo" : "Inactivo",
      actions: <Group gap="xs"><EditUser user={user} /><DeleteUser user_id={user.id} /></Group>
    }
  })

  return (
    <Shell>
      <Group justify="flex-end" m="xl" mr={{base: "xl", sm: 100}}>
        <AddUser />
      </Group>
      <Center m={60}>
        <TableSort headers={userHeaders} data={userData} />
      </Center>
    </Shell>
  );
}