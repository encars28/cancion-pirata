import { Shell } from '../components/UI/Shell/Shell';
import { handleError, handleSuccess, getQueryWithParams } from '../utils';
import { PoemPublicWithAllTheInfo } from '../client/types.gen';
import { Loading } from '../components/Loading';
import { poemsReadPoem } from '../client/sdk.gen';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Flex, Title, Container, Blockquote, Text, Anchor, Stack, Center } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

export function PoemPage() {
  const params = useParams();
  const poemId = params.id;

  const { isPending, isError, isSuccess, data, error } = useQuery({
    ...getQueryWithParams(['poems', poemId], poemsReadPoem, { path: { poem_id: poemId } }),
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

  const poem: PoemPublicWithAllTheInfo = data!;

  enum PoemType {
    TRANSLATION = 0,
    VERSION = 1,
  }

  return (
    <Shell>
      <Flex
        justify="center"
        wrap='wrap'
        gap="xl"
        m="xl"
      >
        <Flex
          justify="center"
          align="center"
          direction="column"
          gap="xl"
          m="xl"
        >
          <Container fluid>
            <Title order={1}>{poem.title}</Title>
            <Title order={3} c="dimmed" fw="lighter">Autor: {poem.author_names}</Title>
          </Container>
          <Container fluid>{poem.content}</Container>
        </Flex>
        {
          poem.original && (
            <Blockquote
              color="blue"
              radius="xl"
              iconSize={60}
              icon={<IconInfoCircle />}
              m="xl"
              miw={200}>
              {poem.type == PoemType.TRANSLATION && (
                <Stack
                  justify='center'
                  h="100%"
                >
                  <Text>
                    Este poema es una traducción.
                  </Text>
                  <Anchor href={`/poems/${poem.original.id}`}>
                    Ver poema original
                  </Anchor>
                </Stack>
              )}

              {poem.type == PoemType.VERSION && (
                <>
                  <Text>
                    Este poema es una versión.
                  </Text>
                  <Anchor href={`/poems/${poem.original.id}`}>
                    Ver poema original
                  </Anchor>
                </>
              )}
            </Blockquote>
          )
        }
      </Flex>
    </Shell>
  )
}