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
      <Title order={3} fw="lighter" ta="center" c="dimmed" mt={100}>
        No se pudieron cargar los poemas.
        <br /> Por favor, inténtalo de nuevo más tarde.
      </Title>
    );
  }

  const user: UserPublic = data!;

  return (
    <ScrollArea h="100%" type="always">
      <Stack p={100} gap={100}>
        <Container className={classes.container}>
          <Paper withBorder shadow="md" p="xl" radius="lg">
            <Title ta="center" order={1} mb="xl">
              Datos de usuario
            </Title>
            <UpdateUserMe user={user} />
          </Paper>
        </Container>
        {currentUser?.author && (
          <Container className={classes.container} >
            <Paper withBorder shadow="md" p="xl" radius="lg">
              <Title ta="center" order={1} mb="xl">
                Datos de autor
              </Title>
              <EditAuthorMe author={currentUser?.author!} />
            </Paper>
          </Container>
        )}
      </Stack>
      {/* <Affix position={{ bottom: 20, right: 20 }}>
        <ActionIcon
          onClick={() =>
            scrollIntoView({
              alignment: "center",
            })
          }
          radius="xl"
        >
          <TbArrowDown size={20} />
        </ActionIcon>
      </Affix> */}
    </ScrollArea>
  );
}
