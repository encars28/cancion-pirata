import { Shell } from '../components/Shell/Shell';
import { handleError } from '../utils';
import { PoemPublicWithAllTheInfo } from '../client/types.gen';
import { Loading } from '../components/Loading';
import { useNavigate, useParams } from 'react-router';
import useAuth from '../hooks/useAuth';
import { List, Title, Container, Flex, Stack, Text, Space, Group, ActionIcon, Tooltip, Anchor } from '@mantine/core';
import usePoem from '../hooks/usePoem';
import usePoemActions from '../hooks/usePoemActions';
import { modals } from '@mantine/modals';
import { TbPencil, TbTrash } from 'react-icons/tb';
import { Interweave } from 'interweave';
import { InfoBox } from '../components/InfoBox';

enum PoemType {
  TRANSLATION = 0,
  VERSION = 1,
}

export function PoemPage() {
  const params = useParams();
  const poemId = params.id;
  const navigate = useNavigate()
  const { user: currentUser } = useAuth();

  const { isPending, isError, data, error } = usePoem(poemId!);
  const { deletePoemMutation } = usePoemActions(poemId!)

  if (isPending) {
    return (<Loading />)
  }

  if (isError) {
    navigate("/poems")
    handleError(error as any);
  }

  const poem: PoemPublicWithAllTheInfo = data!;

  const deletePoem = () => modals.openConfirmModal({
    title: 'Por favor confirme su acción',
    children: (
      <Text size="sm" ta="left">
        ¿Está seguro de que desea borrar este elemento? La acción es irreversible
      </Text>
    ),
    onConfirm: async () => deletePoemMutation.mutateAsync(),
    confirmProps: { color: 'red' },
    labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
  }
  )

  return (
    <Shell>
      <Space h="xl" />
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
            <Title order={3} mt="xs" c="dimmed" fw="lighter">
              Autor: {poem.author_names?.length == 0 ? "Anónimo" : poem.author_names?.join(", ")}
            </Title>
            {((poem.author_ids && currentUser?.author_id && (poem.author_ids.includes(currentUser?.author_id))) || currentUser?.is_superuser) && (
                <Group justify='center' mt="lg" gap="xs">
                  <Tooltip label="Editar">
                    <ActionIcon
                      variant="outline"
                      size={35}
                      onClick={() => navigate(`/poems/edit/${poem.id}`)}
                    >
                      <TbPencil size={20} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Eliminar">
                    <ActionIcon
                      color="red"
                      size={35}
                      onClick={deletePoem}
                    >
                      <TbTrash size={20} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              )}
          </Container>
          <Container fluid><Interweave content={poem.content} /></Container>
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
                <Anchor onClick={ () => navigate(`/poems/${poem.original!.id}`)}>
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
                <Anchor onClick={ () => navigate(`/poems/${poem.original!.id}`)}>
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
                      <Anchor onClick={ () => navigate(`/poems/${derivedPoem.id}`)}>
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