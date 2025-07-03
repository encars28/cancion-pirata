import { AuthorPublicWithPoems, UserPublic } from "../../client";
import {
  Container,
  Group,
  Title,
  Flex,
  Space,
  Tabs,
  Stack,
  Button,
  Text,
  ActionIcon,
  Tooltip,
  Affix,
  Menu,
} from "@mantine/core";
import {
  TbBook,
  TbBookmarks,
  TbEdit,
  TbPointFilled,
  TbTrash,
  TbDots,
  TbWritingSign,
  TbPlus,
} from "react-icons/tb";
import { ShowPoemGrid } from "../Poem/ShowPoemGrid";
import useAuthor from "../../hooks/useAuthor";
import { CollectionGrid } from "../Collection/CollectionGrid/CollectionGrid";
import { modals } from "@mantine/modals";
import { AddCollection } from "../Collection/AddCollection";
import useUserActions from "../../hooks/useUserActions";
import { isAdmin } from "../../hooks/useAuth";
import { PersonAvatar } from "../PersonPicture/PersonAvatar";
import { UploadPicture } from "../PersonPicture/UploadPicture/UploadPicture";
import { EditUser } from "./EditUser";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router";
import { isLoggedIn } from "../../hooks/useAuth";

export function ShowUser({ user }: { user: UserPublic }) {
  let authorData = undefined;
  if (user.author_id) {
    const { data } = useAuthor(user.author_id);
    authorData = data;
  }

  const navigate = useNavigate();
  const { updateUserProfilePicture, deleteUserMutation } =
    useUserActions(user.id);
  const { user: currentUser } = useAuth();
  const pictureUrl = import.meta.env.VITE_IMAGES_DIR + "/users/" + user?.id + ".png"

  const author: AuthorPublicWithPoems | undefined = authorData;

  const addPoemModal = () =>
    modals.open({
      title: "Crear colección",
      children: <AddCollection />,
    });

  const deleteUser = () =>
    modals.openConfirmModal({
      title: "Por favor confirme su acción",
      children: (
        <Text size="sm">
          ¿Está seguro de que desea borrar este elemento? La acción es
          irreversible
        </Text>
      ),
      onConfirm: async () => deleteUserMutation.mutateAsync(),
      confirmProps: { color: "red" },
      labels: { confirm: "Eliminar", cancel: "Cancelar" },
    });

  const editUser = () =>
    modals.open({
      title: "Editar autor",
      children: (
        <Container px="md">
          <EditUser user={user} />
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
              url={pictureUrl}
              updatePicture={updateUserProfilePicture}
              small
            />
          ) : (
            <PersonAvatar
              size={120}
              url={pictureUrl}
            />
          )}
          <Stack gap={2}>
            <Title order={1} textWrap="wrap">
              {user.username}
            </Title>
            <Group>
              {user.full_name && (
                <Text c="dimmed" fw="lighter">
                  {user.full_name}
                </Text>
              )}

              {author && author.birth_date && (
                <>
                  {" "}
                  <TbPointFilled color="grey" size={6} />
                  <Text c="dimmed" fw="lighter">
                    Fecha de nacimiento:{" "}
                    {author.birth_date.toLocaleDateString()}
                  </Text>
                </>
              )}
              {author && author.death_date && (
                <>
                  {" "}
                  <TbPointFilled color="grey" size={6} />
                  <Text c="dimmed" fw="lighter">
                    Fecha de fallecimiento:{" "}
                    {author.death_date.toLocaleDateString()}
                  </Text>
                </>
              )}
            </Group>
          </Stack>
        </Flex>
        {currentUser?.id === user.id && !isAdmin() && (
          <>
            <Group hiddenFrom="lg">
              <Tooltip label="Editar">
                <ActionIcon
                  onClick={() => navigate("/me")}
                  size={35}
                  color="grey"
                  variant="light"
                >
                  <TbEdit size={20} />
                </ActionIcon>
              </Tooltip>
            </Group>
            <Group visibleFrom="lg">
              <Button
                onClick={() => navigate("/me")}
                w={112}
                color="grey"
                variant="light"
                leftSection={<TbEdit size={20} />}
              >
                Editar
              </Button>
            </Group>
          </>
        )}
      </Group>
      <Space h={80} />
      <Tabs variant="outline" defaultValue="collections" pb={100}>
        <Tabs.List>
          {author && (
            <Tabs.Tab value="poems" leftSection={<TbBook size={16} />}>
              Poemas
            </Tabs.Tab>
          )}
          <Tabs.Tab value="collections" leftSection={<TbBookmarks size={18} />}>
            Colecciones
          </Tabs.Tab>
        </Tabs.List>
        {author && (
          <>
            <Tabs.Panel value="poems">
              <Space mt="xl" />
              <ShowPoemGrid poems={author.poems ? author.poems : []} />
            </Tabs.Panel>
          </>
        )}
        <Tabs.Panel value="collections">
          <Space mt="xl" />
          {user.collections && user.collections.length > 0 ? (
            <Stack gap="xl">
              {currentUser?.id === user.id && (
                <Group justify="flex-start">
                  <Button leftSection={<TbPlus />} variant="filled" onClick={addPoemModal}>
                    Crear colección
                  </Button>
                </Group>
              )}
              <CollectionGrid collections={user.collections} />
            </Stack>
          ) : (
            <>
              <Title ta="center" mt={80} order={3} c="dimmed" fw="lighter">
                Este usuario no tiene colecciones
              </Title>
              {currentUser?.id === user.id && (
                <Group justify="center">
                  <Button mt="xl" leftSection={<TbPlus />} variant="filled" onClick={addPoemModal}>
                    Crear colección
                  </Button>
                </Group>
              )}
            </>
          )}
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
                  onClick={editUser}
                >
                  Editar usuario
                </Menu.Item>
                <Menu.Item
                  leftSection={<TbTrash size={16} />}
                  color="red"
                  onClick={deleteUser}
                >
                  Eliminar usuario
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
