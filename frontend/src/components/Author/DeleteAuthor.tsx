import { Button, Modal, Group, Text } from '@mantine/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authorsDeleteAuthor } from '../../client'
import { callService, handleError, handleSuccess } from '../../utils'
import { useDisclosure } from '@mantine/hooks'
import { useNavigate } from 'react-router'

export function DeleteAuthor({ author_id }: { author_id: string}) {
  const queryClient = useQueryClient()
  const [opened, { open, close }] = useDisclosure()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async () => callService(authorsDeleteAuthor, { path: { author_id: author_id } }),
    onSuccess: () => {
      handleSuccess()
      close()
      navigate('/authors')
    },
    onError: (error) => {
      handleError(error as any)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] })
      queryClient.invalidateQueries({ queryKey: ['authors', author_id] })
    }
  })

  const deleteAuthor = async () => {
    try {
      await mutation.mutateAsync()
    } catch {
      // error is handled by deleteAuthor
    }
  }

  return (
    <>
      <Button
        color="red"
        onClick={open}
      >
        Eliminar autor
      </Button>
      <Modal
        opened={opened}
        onClose={close}
        title="Eliminar autor"
        ta="left"
        padding={30}
        overlayProps={{
          blur: 3,
        }}
        centered>
        <Text mt="sm">¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.</Text>
        <Group mt={40} justify="flex-end" mb="md">
          <Button onClick={close} variant="default">
            Cancel
          </Button>
          <Button onClick={deleteAuthor} color="red">
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  )
}