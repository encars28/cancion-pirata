import { UserPublic, usersReadUserMe } from "../client";
import { UserMe } from "./User/UserMe";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "./Loading";
import { handleError, callService } from "../utils";
import { useNavigate } from "react-router";
import { Group, Title, Container } from "@mantine/core";

export function Profile() {
  const navigate = useNavigate()
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
      </Group>
      <Title order={1} m="xl">Datos usuario</Title>
      <Container size={550}>
        <UserMe user={user} />
      </Container>

    </>
  );
}