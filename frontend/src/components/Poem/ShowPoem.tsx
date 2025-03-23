import { PoemPublicWithAllTheInfo } from '../../client/types.gen';
import { Link } from 'react-router';
import { Flex, Title, Container, Stack, List, Text, Space } from '@mantine/core';
import { InfoBox } from '../InfoBox';

export function ShowPoem({ poem }: { poem: PoemPublicWithAllTheInfo }) {

  enum PoemType {
    TRANSLATION = 0,
    VERSION = 1,
  }

  return (
    <Flex
      justify="center"
      wrap='wrap'
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
          <Title order={3} c="dimmed" fw="lighter">Autor: {poem.author_names?.join(", ")}</Title>
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
              <Link to={`/poems/${poem.original.id}`}>
                Ver poema original
              </Link>
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
              <Link to={`/poems/${poem.original.id}`}>
                Ver poema original
              </Link>
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
                    <Link to={`/poems/${derivedPoem.id}`}>
                      {derivedPoem.title}
                    </Link>
                  </List.Item>
                ))}
              </List>
            </InfoBox>
          )
        }
      </Stack>
    </Flex>
  )
}