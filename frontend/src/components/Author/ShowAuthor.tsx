import { AuthorPublicWithPoems } from "../../client";
import {
  Stack,
  Container,
  Group,
  Title,
  Flex,
  Space,
  Text,
  Tabs,
  ActionIcon,
  Tooltip,
  Button,
} from "@mantine/core";
import { TbBook, TbTrash, TbPointFilled, TbEdit } from "react-icons/tb";
import { isAdmin } from "../../hooks/useAuth";
import { modals } from "@mantine/modals";
import useAuthorActions from "../../hooks/useAuthorActions";
import { ShowPoemGrid } from "../Poem/ShowPoemGrid";
import { EditAuthor } from "./EditAuthor";
import { PersonAvatar } from "../PersonPicture/PersonAvatar";
import { UploadPicture } from "../PersonPicture/UploadPicture/UploadPicture";

export function ShowAuthor({ author }: { author: AuthorPublicWithPoems }) {
  const { deleteAuthorMutation, authorProfilePicture, updateProfilePicture } =
    useAuthorActions(author.id);

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

  const editAuthor = () =>
    modals.open({
      title: "Editar autor",
      children: (
        <Container px="md">
          <EditAuthor author={author} />
        </Container>
      ),
    });

  return (
    <Container
      mx={{ base: "xl", xs: 40, sm: 50, md: 60, lg: 80, xl: 100 }}
      fluid
    >
      <Group justify="space-between" gap="xl" wrap="nowrap">
        <Flex
          justify="flex-start"
          direction="row"
          align="center"
          gap="xl"
          wrap="nowrap"
        >
          {isAdmin() ? (
            <UploadPicture
              updatePicture={updateProfilePicture}
              currentPicture={(authorProfilePicture as Blob) ?? null}
              small
            />
          ) : (
            <PersonAvatar
              picture={(authorProfilePicture as Blob) ?? null}
              size={120}
            />
          )}

          <Stack>
            <Title order={1} textWrap="wrap">
              {author.full_name}
            </Title>
            <Group>
              {" "}
              {author && author.birth_date && (
                <Text c="dimmed" fw="lighter">
                  Fecha de nacimiento: {author.birth_date.toLocaleDateString()}
                </Text>
              )}
              {author && author.death_date && (
                <Group wrap="nowrap">
                  {" "}
                  <TbPointFilled color="grey" size={6} />
                  <Text c="dimmed" fw="lighter">
                    Fecha de fallecimiento:{" "}
                    {author.death_date.toLocaleDateString()}
                  </Text>
                </Group>
              )}
            </Group>
          </Stack>
        </Flex>
        {isAdmin() && (
          <>
            <Group hiddenFrom="lg">
              <Tooltip label="Editar">
                <ActionIcon onClick={editAuthor} size={35}>
                  <TbEdit size={20} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Eliminar">
                <ActionIcon color="red" size={35} onClick={deleteAuthor}>
                  <TbTrash size={20} />
                </ActionIcon>
              </Tooltip>
            </Group>
            <Group visibleFrom="lg">
              <Button
                onClick={editAuthor}
                w={112}
                leftSection={<TbEdit size={20} />}
              >
                Editar
              </Button>
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
          <Tabs.Tab value="poems" leftSection={<TbBook size={12} />}>
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
