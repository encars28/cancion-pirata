import { useQuery } from '@tanstack/react-query';
import { handleError, getQueryWithParams } from '../utils';
import { AuthorPublicWithPoems } from '../client/types.gen';
import { Loading } from '../components/Loading';
import { authorsReadAuthorById } from '../client/sdk.gen';
import { useParams } from 'react-router';
import { Avatar, Flex, Space, Tabs, Title, Container, Group, Button } from '@mantine/core';
import { Shell } from '../components/Shell/Shell';
import { TablePoems, RowData } from '../components/Tables/TablePoems/TablePoems';
import { IconVocabulary } from '@tabler/icons-react';
import useAuth from '../hooks/useAuth';

export function AuthorPage() {
  const params = useParams();
  const authorId = params.id;
  const { user: currentUser } = useAuth();

  const { isPending, isError, data, error } = useQuery({
    ...getQueryWithParams(['authors', authorId], authorsReadAuthorById, { path: { author_id: authorId } }),
    placeholderData: (prevData) => prevData,
  })

  if (isPending) {
    return (<Loading />)
  }

  if (isError) {
    handleError(error as any);
  }

  const author: AuthorPublicWithPoems = data!;
  if (!author.poems) {
    author.poems = [];
  }

  const poemData: RowData[] = author.poems.map(poem => {
    return {
      title: poem.title,
      created_at: poem.created_at ?? 'Unknown',
      language: poem.language ?? 'Unknown',
      link: `/poems/${poem.id}`
    }
  })


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
          {currentUser && <Button
            variant="light"
          >
            Modificar datos
          </Button> }
        </Group>
        <Space mt="xl" />
        <Tabs variant="pills" defaultValue="poems">
          <Tabs.List>
            <Tabs.Tab value="poems" leftSection={<IconVocabulary size={12} />}>
              Poemas
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="poems">
            <Space mt="xl" />
            <TablePoems data={poemData} />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </Shell>
  )
}