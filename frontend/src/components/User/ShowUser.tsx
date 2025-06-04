import { AuthorPublicWithPoems, UserPublic } from "../../client";
import {
  Container,
  Group,
  Title,
  Avatar,
  Flex,
  Space,
  Tabs,
  Stack,
  Button,
  Text,
} from "@mantine/core";
import { TbBook, TbBooks, TbPointFilled } from "react-icons/tb";
import { ShowPoemGrid } from "../Poem/PoemGrid/ShowPoemGrid";
import useAuthor from "../../hooks/useAuthor";
import { CollectionGrid } from "../Collection/CollectionGrid";
import { modals } from "@mantine/modals";
import { AddCollection } from "../Collection/AddCollection";
import useUserActions from "../../hooks/useUserActions";

export function ShowUser({ user }: { user: UserPublic }) {
  let authorData = undefined;
  const { userProfilePicture } = useUserActions(user.id);

  if (user.author_id) {
    const { data } = useAuthor(user.author_id);
    authorData = data;
  }

  const author: AuthorPublicWithPoems | undefined = authorData;

  const addPoemModal = () =>
    modals.open({
      title: "Crear colección",
      children: <AddCollection />,
    });

  return (
    <Container
      mt={70}
      mx={{ base: "xl", xs: 40, sm: 50, md: 60, lg: 80, xl: 100 }}
      fluid
    >
      <Group justify="space-between" gap="xl">
        <Flex justify="flex-start" direction="row" align="center" gap="xl">
          {userProfilePicture ? (
            <Avatar
              src={URL.createObjectURL(userProfilePicture as Blob)}
              size={100}
              alt="Foto de perfil"
            />
          ) : (
            <Avatar size={100} alt="Foto de perfil" />
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
              {author && author.death_date &&(
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
      </Group>
      <Space h={80} />
      <Tabs variant="outline" defaultValue="collections" pb={100}>
        <Tabs.List>
          {author && (
            <Tabs.Tab value="poems" leftSection={<TbBook size={16} />}>
              Poemas
            </Tabs.Tab>
          )}
          <Tabs.Tab value="collections" leftSection={<TbBooks size={18} />}>
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
              <Group justify="flex-start">
                <Button variant="filled" onClick={addPoemModal}>
                  Crear colección
                </Button>
              </Group>
              <CollectionGrid collections={user.collections} />
            </Stack>
          ) : (
            <>
              <Title ta="center" mt={80} order={3} c="dimmed" fw="lighter">
                Este usuario no tiene colecciones
              </Title>
              <Group justify="center">
                <Button mt="xl" variant="filled" onClick={addPoemModal}>
                  Crear colección
                </Button>
              </Group>
            </>
          )}
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
