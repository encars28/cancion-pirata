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
} from "@mantine/core";
import { TbUser, TbBook, TbBooks } from "react-icons/tb";
import { EditAuthor } from "../Author/EditAuthor/EditAuthor";
import { ShowPoemGrid } from "../Poem/PoemGrid/ShowPoemGrid";
import useAuthor from "../../hooks/useAuthor";
import { CollectionGrid } from "../Collection/CollectionGrid";

export function ShowUser({ user }: { user: UserPublic }) {
  let authorData = undefined;

  if (user.author_id) {
    const { data } = useAuthor(user.author_id);
    authorData = data;
  }

  const author: AuthorPublicWithPoems | undefined = authorData;

  return (
    <Container
      mt="xl"
      ml={{ base: "xl", xs: 40, sm: 50, md: 60, lg: 80, xl: 100 }}
      mr={{ base: "xl", xs: 40, sm: 50, md: 60, lg: 80, xl: 100 }}
      fluid
    >
      <Group justify="space-between" gap="xl">
        <Flex justify="flex-start" align="center" gap="xl">
          <Avatar size="xl" />
          <Stack gap="xs">
            <Title order={1} textWrap="wrap">
              {user.username}
            </Title>
            {user.full_name && (
              <Title
                order={3}
                ta="left"
                c="dimmed"
                fw="lighter"
                textWrap="wrap"
              >
                {user.full_name}
              </Title>
            )}
          </Stack>
        </Flex>
      </Group>
      <Space h={80} />
      <Tabs variant="outline" defaultValue="collections">
        <Tabs.List>
          {author && (
            <>
              <Tabs.Tab value="poems" leftSection={<TbBook size={16} />}>
                Poemas
              </Tabs.Tab>
              <Tabs.Tab value="info" leftSection={<TbUser size={16} />}>
                Información
              </Tabs.Tab>
            </>
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
            <Tabs.Panel value="info">
              <Space mt="xl" />
              <EditAuthor author={author} />
            </Tabs.Panel>
          </>
        )}
        <Tabs.Panel value="collections">
          <Space mt="xl" />
          {user.collections && user.collections.length > 0 ? (
            <CollectionGrid collections={user.collections} />
          ) : (
            <Title mt={80} order={3} c="dimmed" fw="lighter">
              Este usuario no tiene colecciones
            </Title>
          )}
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
