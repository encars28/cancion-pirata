import { AuthorPublicWithPoems } from "../../client";
import {
  Stack,
  Container,
  Group,
  Title,
  Avatar,
  Flex,
  Space,
  Text,
  Tabs,
  ActionIcon,
  Tooltip,
  Button,
} from "@mantine/core";
import { TbUser, TbVocabulary, TbTrash, TbPointFilled } from "react-icons/tb";
import useAuth from "../../hooks/useAuth";
import { EditAuthor } from "./EditAuthor/EditAuthor";
import { modals } from "@mantine/modals";
import useAuthorActions from "../../hooks/useAuthorActions";
import { ShowPoemGrid } from "../Poem/PoemGrid/ShowPoemGrid";

export function ShowAuthor({ author }: { author: AuthorPublicWithPoems }) {
  const { user: currentUser } = useAuth();
  const { deleteAuthorMutation } = useAuthorActions(author.id);

  const deleteAuthor = () =>
    modals.openConfirmModal({
      title: "Por favor confirme su acción",
      children: (
        <Text size="sm">
          ¿Está seguro de que desea borrar este elemento? La acción es
          irreversible
        </Text>
      ),
      onConfirm: async () => deleteAuthorMutation.mutateAsync(),
      confirmProps: { color: "red" },
      labels: { confirm: "Eliminar", cancel: "Cancelar" },
    });

  return (
    <Container
      mt="xl"
      ml={{ base: "xl", xs: 40, sm: 50, md: 60, lg: 80, xl: 100 }}
      mr={{ base: "xl", xs: 40, sm: 50, md: 60, lg: 80, xl: 100 }}
      fluid
    >
      <Group justify="space-between" gap="xl">
        <Flex justify="flex-start" direction="row" align="center" gap="xl">
          <Avatar size="xl" />
          <Stack>
            <Title order={1} textWrap="wrap">
              {author.full_name}
            </Title>
            {author && author.birth_date && (
              <>
                {" "}
                <TbPointFilled color="grey" size={6} />
                <Text c="dimmed" fw="lighter">
                  Fecha de nacimiento: {author.birth_date.toLocaleDateString()}
                </Text>
              </>
            )}
          </Stack>
        </Flex>
        {currentUser?.is_superuser && (
          <>
            <Group hiddenFrom="md">
              <Tooltip label="Eliminar">
                <ActionIcon color="red" size={35} onClick={deleteAuthor}>
                  <TbTrash size={20} />
                </ActionIcon>
              </Tooltip>
            </Group>
            <Group visibleFrom="md">
              <Button
                color="red"
                onClick={deleteAuthor}
                leftSection={<TbTrash size={20} />}
              >
                Eliminar
              </Button>
            </Group>
          </>
        )}
      </Group>
      <Space h={60} />
      <Tabs variant="outline" defaultValue="poems">
        <Tabs.List>
          <Tabs.Tab value="poems" leftSection={<TbVocabulary size={12} />}>
            Poemas
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="poems">
          <Space mt="xl" />
          <ShowPoemGrid poems={author.poems ? author.poems : []} />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
