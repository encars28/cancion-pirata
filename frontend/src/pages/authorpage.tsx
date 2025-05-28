import { useQuery } from '@tanstack/react-query';
import { callService, handleError } from '../utils';
import { AuthorPublicWithPoems } from '../client/types.gen';
import { Loading } from '../components/Loading';
import { authorsReadAuthorById } from '../client/sdk.gen';
import { useParams } from 'react-router';
import { Avatar, Text, Flex, Space, Tabs, Title, Container, Group, ActionIcon, Tooltip } from '@mantine/core';
import { Shell } from '../components/Shell/Shell';
import { TbVocabulary } from "react-icons/tb";
import useAuth from '../hooks/useAuth';
import { EditAuthor } from '../components/Author/EditAuthor';
import { useNavigate } from 'react-router';
import { modals } from '@mantine/modals';
import useAuthorActions from '../hooks/useAuthorActions';
import { TbTrash } from 'react-icons/tb';

export function AuthorPage() {
  const params = useParams();
  const authorId = params.id;
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { deleteAuthorMutation} = useAuthorActions(authorId!)

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

  const deleteAuthor = () => modals.openConfirmModal({
    title: 'Por favor confirme su acción',
    children: (
      <Text size="sm" ta="left">
        ¿Está seguro de que desea borrar este elemento? La acción es irreversible
      </Text>
    ),
    onConfirm: async () => deleteAuthorMutation.mutateAsync(),
    confirmProps: { color: 'red' },
    labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
  }
  )

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
              {/* <EditAuthor author={author} icon/> */}
              <Tooltip label="Eliminar">
                <ActionIcon
                  color="red"
                  size={35}
                  onClick={deleteAuthor}
                >
                  <TbTrash size={20} />
                </ActionIcon>
              </Tooltip>
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
            
          </Tabs.Panel>
        </Tabs>
      </Container>
    </Shell>
  )
}