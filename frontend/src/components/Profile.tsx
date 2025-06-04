import { UserPublic, usersReadUserMe } from "../client";
import { UserMe } from "./User/UserMe";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "./Loading";
import { showError, callService } from "../utils";
import { useNavigate } from "react-router";
import {
  Group,
  Title,
  Container,
  Stack,
  Flex,
  Center,
  Paper,
} from "@mantine/core";

export function Profile() {
  const navigate = useNavigate();
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["users", "me"],
    queryFn: async () => callService(usersReadUserMe),
    placeholderData: (prevData) => prevData,
  });

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    navigate("/");
    showError(error as any);
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
