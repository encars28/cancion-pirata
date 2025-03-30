import { useQuery } from '@tanstack/react-query';
import { callService, handleError } from '../utils';
import { AuthorPublicWithPoems } from '../client/types.gen';
import { Loading } from '../components/Loading';
import { authorsReadAuthorById } from '../client/sdk.gen';
import { useParams } from 'react-router';
import { Avatar, Button, Flex, Space, Tabs, Title, Container, Group, ActionIcon } from '@mantine/core';
import { Shell } from '../components/Shell/Shell';
import { TbEye, TbVocabulary } from "react-icons/tb";
import useAuth from '../hooks/useAuth';
import { EditAuthor } from '../components/Author/EditAuthor';
import { DeleteAuthor } from '../components/Author/DeleteAuthor';
import { useNavigate } from 'react-router';
import { TableSort } from '../components/Tables/TableSort';
import { DeletePoem } from '../components/Poem/DeletePoem';

export function AuthorPage() {
  const params = useParams();
  const authorId = params.id;
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['authors', authorId],
    queryFn: async () => callService(authorsReadAuthorById, { path: { author_id: authorId! } }),
    placeholderData: (prevData) => prevData,
  })

  if (isPending) {
    return (<Loading />)
  }

  if (isError) {
    navigate("/authors")
    handleError(error as any);
  }

  const author: AuthorPublicWithPoems = data!;

  const poemData = author.poems!.map(poem => {
    return {
      id: poem.id,
      title: poem.title,
      created_at: poem.created_at?.toLocaleDateString() ?? 'Unknown',
      language: poem.language ?? 'Unknown',
      actions: <Group gap="xs">
        <ActionIcon variant='outline' onClick={() => navigate(`/poems/${poem.id}`)}>
          <TbEye />
        </ActionIcon>
        <DeletePoem poem_id={poem.id} icon={true}/>
      </Group>
    }
  })

  const poemHeaders = {
    title: 'Título',
    created_at: 'Fecha de creación',
    language: 'Idioma',
    actions: 'Acciones'
  }

  return (
    <Shell>
      <Container
        mt="xl"
        ml={{ base: 'xl', xs: 40, sm: 50, md: 60, lg: 80, xl: 100 }}
        mr={{ base: 'xl', xs: 40, sm: 50, md: 60, lg: 80, xl: 100 }}
        fluid
      >
        <Group
          justify="space-between"
          gap="xl"
        >
          <Flex
            justify="flex-start"
            align="center"
            gap="xl"
          >
            <Avatar size="xl" />
            <Title order={1}>{author.full_name}</Title>
          </Flex>
          {(currentUser?.author_id == author.id || currentUser?.is_superuser) && (
            <Group>
              <EditAuthor author={author} />
              <DeleteAuthor author_id={author.id} />
              <Button onClick={() => navigate("/poems/add")}>Crear poema</Button>
            </Group>
          )}
        </Group>
        <Space mt={100} />
        <Tabs variant="pills" defaultValue="poems">
          <Tabs.List>
            <Tabs.Tab value="poems" leftSection={<TbVocabulary size={12} />}>
              Poemas
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="poems">
            <Space mt="xl" />
            <TableSort data={poemData} headers={poemHeaders} miw={700} />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </Shell>
  )
}