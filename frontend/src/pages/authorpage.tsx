import { useQuery } from '@tanstack/react-query';
import { handleError, handleSuccess, getQueryWithParams } from '../utils';
import { AuthorPublicWithPoems } from '../client/types.gen';
import { Loading } from '../components/Loading';
import { authorsReadAuthorById } from '../client/sdk.gen';
import { useParams } from 'react-router';
import { Avatar, Flex, Title } from '@mantine/core';
import { Shell } from '../components/UI/Shell/Shell';
import { TableSort } from '../components/UI/Tables/TableSort/TableSort';

interface RowData {
  title: string;
  created_at: string;
  language: string;
}

export function AuthorPage() {
  const params = useParams();
  const authorId = params.id;

  const { isPending, isError, isSuccess, data, error } = useQuery({
    ...getQueryWithParams(['authors', authorId], authorsReadAuthorById, {path: {author_id: authorId}}),
    placeholderData: (prevData) => prevData,
  })

  if (isPending) {
    return (<Loading />)
  }

  if (isError) {
    handleError(error as any);
  }

  if (isSuccess) {
    handleSuccess();
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
    }
  })


  return (
    <Shell>
      <Flex
        wrap="wrap"
        justify="flex-start"
        align="center"
        gap="xl"
        mt={{base: 'xl', md: 50}}
        mb="xl"
        ml={{base: 'xl', xs: 40, sm: 50, md: 60, lg: 80, xl:100}}
      >
        <Avatar size="xl" />
        <Title order={1}>{author.full_name}</Title>
      </Flex>
      <TableSort data={poemData} />
    </Shell>
  )
}