import { Button, Modal, Group, Text, ActionIcon } from '@mantine/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersDeleteUser } from '../../client'
import { callService, handleError, handleSuccess } from '../../utils'
import { useDisclosure } from '@mantine/hooks'
import { TbTrash } from 'react-icons/tb'

export function DeleteUser({user_id}: {user_id: string}) {
  const queryClient = useQueryClient()
  const [opened, { open, close }] = useDisclosure()

  const mutation = useMutation({
    mutationFn: async () => callService(usersDeleteUser, {path: {user_id: user_id}}),
    onSuccess: () => {
      handleSuccess()
      close()
    },
    onError: (error) => {
      handleError(error as any)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  const deleteUser = async () => {
    try {
      await mutation.mutateAsync()
    } catch {
      // error is handled by deleteAuthor
    }
  }

  return (
    <>
      <ActionIcon
        color="red"
        onClick={open}
      >
        <TbTrash />
      </ActionIcon>
      <Modal
        opened={opened}
        onClose={close}
        title="Eliminar usuario"
        
        padding={30}
        overlayProps={{
          blur: 3,
        }}
        centered>
        <Text mt="sm">¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.</Text>
        <Group mt={40} justify="flex-end" mb="md">
          <Button onClick={close} variant="default">
            Cancelar
          </Button>
          <Button onClick={deleteUser} color="red" loading={mutation.isPending} loaderProps={{type: 'dots'}}>
            Eliminar
          </Button>
        </Group>
      </Modal>
    </>
  )
}