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
  Affix,
  Menu,
} from "@mantine/core";
import {
  TbBook,
  TbTrash,
  TbPointFilled,
  TbEdit,
  TbWritingSign,
  TbDots
} from "react-icons/tb";
import { modals } from "@mantine/modals";
import useAuthorActions from "../../hooks/useAuthorActions";
import { ShowPoemGrid } from "../Poem/ShowPoemGrid";
import { EditAuthor } from "./EditAuthor";
import { PersonAvatar } from "../PersonPicture/PersonAvatar";
import { UploadPicture } from "../PersonPicture/UploadPicture/UploadPicture";
import { isLoggedIn, isAdmin } from "../../hooks/useAuth";
import { useNavigate } from "react-router";

export function ShowAuthor({ author }: { author: AuthorPublicWithPoems }) {
  const { deleteAuthorMutation, updateProfilePicture } = useAuthorActions(
    author.id
  );
  const pictureUrl =
    import.meta.env.VITE_IMAGES_DIR + "/authors/" + author.id + ".png";
  const navigate = useNavigate();

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
              url={pictureUrl}
              small
            />
          ) : (
            <PersonAvatar url={pictureUrl} size={120} />
          )}

          <Stack>
            <Title order={1} textWrap="wrap">
              {author.full_name}
            </Title>
            <Group>
              {" "}
              {author && author.birth_date && (
                <Text c="dimmed" fw={250}>
                  Fecha de nacimiento: {author.birth_date.toLocaleDateString()}
                </Text>
              )}
              {author && author.death_date && (
                <Group wrap="nowrap">
                  {" "}
                  <TbPointFilled color="grey" size={6} />
                  <Text c="dimmed" fw={250}>
                    Fecha de fallecimiento:{" "}
                    {author.death_date.toLocaleDateString()}
                  </Text>
                </Group>
              )}
            </Group>
          </Stack>
        </Flex>
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
      <Affix bottom={{ base: 100, xs: 60 }} right={{ base: 30, xs: 70 }}>
        <Stack align="center" justify="center" gap="md">
          {isAdmin() && (
            <Menu
              position="top"
              transitionProps={{ transition: "pop" }}
              withArrow
            >
              <Menu.Target>
                <ActionIcon
                  variant="light"
                  style={{ backgroundColor: "#d0ebff" }}
                  size="lg"
                  radius="xl"
                >
                  <TbDots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<TbEdit size={16} />}
                  onClick={editAuthor}
                >
                  Editar autor
                </Menu.Item>
                <Menu.Item
                  leftSection={<TbTrash size={16} />}
                  color="red"
                  onClick={deleteAuthor}
                >
                  Eliminar autor
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}

          <Tooltip label="Nuevo poema">
            <ActionIcon
              size={50}
              variant="filled"
              radius="xl"
              onClick={
                isLoggedIn()
                  ? () => navigate("/poems/add")
                  : () => navigate("/login")
              }
            >
              <TbWritingSign size={25} />
            </ActionIcon>
          </Tooltip>
        </Stack>
      </Affix>
    </Container>
  );
}
