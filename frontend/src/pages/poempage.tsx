import { Shell } from '../components/Shell/Shell';
import { handleError } from '../utils';
import { PoemPublicWithAllTheInfo } from '../client/types.gen';
import { Loading } from '../components/Loading';
import { useNavigate, useParams } from 'react-router';
import useAuth from '../hooks/useAuth';
import { ShowPoem } from '../components/Poem/ShowPoem';
import { Button, Stack, Text, Space, Group } from '@mantine/core';
import usePoem from '../hooks/usePoem';
import usePoemActions from '../hooks/usePoemActions';
import { modals } from '@mantine/modals';

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
      <Stack gap="xs">
        {((poem.author_ids && currentUser?.author_id && (poem.author_ids.includes(currentUser?.author_id))) || currentUser?.is_superuser) && (
          <Group justify='flex-end' mt="xl" mr={{ base: "xl", md: 100, lg: 150 }}>
            <Button
              variant="outline"
              onClick={() => navigate(`/poems/edit/${poem.id}`)}
            >
              Editar poema
            </Button>
            <Button
              color="red"
              onClick={deletePoem}
            >
              Eliminar poema
            </Button>
          </Group>
        )}
        <ShowPoem poem={poem} />
      </Stack>
    </Shell>
  )
}