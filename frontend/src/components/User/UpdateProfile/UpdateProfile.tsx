import { UserPublic, usersReadUserMe } from "../../../client";
import { UpdateUserMe } from "../UpdateUserMe";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "../../Loading";
import { callService } from "../../../utils";
import {
  Title,
  Container,
  Paper,
  Stack,
  ScrollArea,
  Affix,
  Transition,
  ActionIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { errorNotification } from "../../../notifications";
import { EditAuthorMe } from "../../Author/EditAuthorMe";
import useAuth from "../../../hooks/useAuth";
import classes from "./UpdateProfile.module.css";
import { TbArrowDown } from "react-icons/tb";
import { useScrollIntoView } from "@mantine/hooks";

export function UpdateProfile() {
  const { user: currentUser } = useAuth();
  // const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
  //   offset: 60,
  // });

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["users", "me"],
    queryFn: async () => callService(usersReadUserMe),
    placeholderData: (prevData) => prevData,
  });

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    notifications.clean();
    notifications.show(
      errorNotification({
        title: "Error al cargar el perfil",
        description: error.message,
      })
    );

    return (
      <Title order={3} fw={250} ta="center" c="dimmed" mt={100}>
        No se pudieron cargar los poemas.
        <br /> Por favor, inténtalo de nuevo más tarde.
      </Title>
    );
  }

  const user: UserPublic = data!;

  return (
    <Container className={classes.container}>
      <Paper withBorder shadow="md" p="xl" radius="lg">
        <Stack gap={60}>
          <Stack>
            <Title order={5} c="dimmed" fw="normal">
              Información de la cuenta
            </Title>
            <UpdateUserMe user={user} />
          </Stack>
          {currentUser?.author && (
            <Stack>
              <Title order={5} c="dimmed" fw="normal">
                Información adicional
              </Title>
              <EditAuthorMe author={currentUser?.author!} />
            </Stack>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
