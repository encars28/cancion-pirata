import { Button, Modal, Group, Text } from '@mantine/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersDeleteUserMe } from '../../client'
import { callService, showError, showSuccess } from '../../utils'
import { useDisclosure } from '@mantine/hooks'
import { useNavigate } from 'react-router'
import useAuth from '../../hooks/useAuth'

export function DeleteUserMe() {
  const queryClient = useQueryClient()
  const [opened, { open, close }] = useDisclosure()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const mutation = useMutation({
    mutationFn: async () => callService(usersDeleteUserMe),
    onSuccess: () => {
      showSuccess()
      close()
      logout()
      navigate('/')
    },
    onError: (error) => {
      showError(error as any)
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
      <Button
        color="red"
        onClick={open}
      >
        Eliminar usuario
      </Button>
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