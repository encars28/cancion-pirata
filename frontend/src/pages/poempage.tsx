import { Shell } from '../components/Shell/Shell';
import { handleError, handleSuccess, getQueryWithParams } from '../utils';
import { PoemPublicWithAllTheInfo } from '../client/types.gen';
import { Loading } from '../components/Loading';
import { poemsReadPoem } from '../client/sdk.gen';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Flex, Title, Container, Stack, List, Text, Anchor, Space } from '@mantine/core';
import { InfoBox } from '../components/InfoBox';

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
        mt="xl"
      >
        <Flex
          justify="center"
          align="center"
          direction="column"
          gap="xl"
          mt="xl"
          w={{ base: "100%", sm: "60%" }}
        >
          <Container fluid>
            <Title order={1}>{poem.title}</Title>
            <Title order={3} c="dimmed" fw="lighter">Autor: {poem.author_names}</Title>
          </Container>
          <Container fluid>{poem.content}</Container>
          <Space h="xl" />
        </Flex>
        <Stack>
          {
            (poem.original && poem.type == PoemType.TRANSLATION) &&
            (
              <InfoBox>
                <Text>
                  Este poema es una traducción.
                </Text>
                <Anchor href={`/poems/${poem.original.id}`}>
                  Ver poema original
                </Anchor>
              </InfoBox>
            )
          }
          {
            (poem.original && poem.type == PoemType.VERSION) &&
            (
              <InfoBox>
                <Text>
                  Este poema es una versión.
                </Text>
                <Anchor href={`/poems/${poem.original.id}`}>
                  Ver poema original
                </Anchor>
              </InfoBox>
            )
          }
          {
            (poem.derived_poems && poem.derived_poems.length > 0) && (
              <InfoBox>
                <Text>
                  Este poema tiene derivados.
                </Text>
                <List ta="left" withPadding>
                  {poem.derived_poems.map((derivedPoem) => (
                    <List.Item key={derivedPoem.id}>
                      <Anchor href={`/poems/${derivedPoem.id}`}>
                        {derivedPoem.title}
                      </Anchor>
                    </List.Item>
                  ))}
                </List>
              </InfoBox>
            )
          }
        </Stack>
      </Flex>
    </Shell>
  )
}