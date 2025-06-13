import { UserPublic, usersReadUserMe } from "../../client";
import { UserMe } from "./UserMe";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "../Loading";
import { callService } from "../../utils";
import {
  Title,
  Container,
  Paper,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { errorNotification } from "../../notifications";

export function Profile() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["users", "me"],
    queryFn: async () => callService(usersReadUserMe),
    placeholderData: (prevData) => prevData,
  });

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    notifications.clean()
    notifications.show(errorNotification({
      title: "Error al cargar el perfil", description: error.message}))
    
    return (
      <Title order={3} fw="lighter" ta="center" c="dimmed" mt={100}>
        No se pudieron cargar los poemas.<br/> Por favor, inténtalo de nuevo más tarde.
      </Title>
    )
  }

  const user: UserPublic = data!;

  return (
    <Container size={550} h="100%" style={{ alignContent: "center" }}>
      <Paper withBorder shadow="md" p="xl" radius="lg">
        <Title ta="center" order={1} mb="xl">
          Perfil
        </Title>
        <UserMe user={user} />
      </Paper>
    </Container>
  );
}
