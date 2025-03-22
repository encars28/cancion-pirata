import { Shell } from '../components/Shell/Shell';
import { callService, handleError } from '../utils';
import { PoemPublicWithAllTheInfo } from '../client/types.gen';
import { Loading } from '../components/Loading';
import { poemsReadPoem } from '../client/sdk.gen';
import { useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../hooks/useAuth';
import { ShowPoem } from '../components/Poem/ShowPoem';
import { EditPoem } from '../components/Poem/EditPoem';
import { Button, Stack, Group, ActionIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { TbX } from 'react-icons/tb';

export function PoemPage() {
  const params = useParams();
  const poemId = params.id;
  const navigate = useNavigate()
  const { user: currentUser } = useAuth();
  const [opened, { open, close }] = useDisclosure()

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['poems', poemId],
    queryFn: async () => callService(poemsReadPoem, { path: { poem_id: poemId! } }),
    placeholderData: (prevData) => prevData,
  })

  if (isPending) {
    return (<Loading />)
  }

  if (isError) {
    navigate("/poems")
    handleError(error as any);
  }

  const poem: PoemPublicWithAllTheInfo = data!;
  return (
    <Shell>
      {!opened && (
        <Stack>
          {((poem.author_ids && currentUser?.author_id && (poem.author_ids.includes(currentUser?.author_id))) || currentUser?.is_superuser) && (
            <Group justify='flex-end' mt="xl" mr={{ base: "xl", md: 100, lg: 150 }} mb="xl">
              <Button variant="outline" onClick={open}>Editar poema</Button>
              <Button color="red">Eliminar poema</Button>
            </Group>
          )}
          <ShowPoem poem={poem} />
        </Stack>
      )}
      {opened && (
        <Stack>
          <EditPoem poem={poem} close={close} />
        </Stack>
      )}
    </Shell>
  )
}