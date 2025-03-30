import { UserPublic, usersReadUserMe } from "../client";
import { UserMe } from "./User/UserMe";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "./Loading";
import { handleError, callService } from "../utils";
import { useNavigate } from "react-router";
import { Button, Container, Group, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DeleteUserMe } from "./User/DeleteUserMe";

export function Profile() {
  const navigate = useNavigate()
  const [opened, { toggle }] = useDisclosure()
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: async () => callService(usersReadUserMe),
    placeholderData: (prevData) => prevData,
  })

  if (isPending) {
    return (<Loading />)
  }

  if (isError) {
    navigate("/")
    handleError(error as any);
  }

  const user: UserPublic = data!

  return (
    <>
      <Group m="xl" justify="flex-end">
        <DeleteUserMe />
        <Button
          onClick={toggle}
          variant={opened ? "outline" : "filled"}
          color={opened ? "red" : undefined}
          mr={{ base: "sm", sm: "xl" }}
        >
          {opened ? 'Cerrar' : 'Editar'}
        </Button>
      </Group>
      <Container size={600} ta="left">
        <Title order={1} m="xl">Datos usuario</Title>
        <UserMe edit={opened} user={user} />
      </Container>
    </>
  );
}