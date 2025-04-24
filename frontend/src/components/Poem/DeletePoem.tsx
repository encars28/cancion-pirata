import { Button, Modal, Group, Text, ActionIcon } from '@mantine/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { poemsDeletePoem } from '../../client'
import { callService, handleError, handleSuccess } from '../../utils'
import { useDisclosure } from '@mantine/hooks'
import { TbTrash } from 'react-icons/tb'

export function DeletePoem({ poem_id, icon }: { poem_id: string, icon?: boolean }) {
  const queryClient = useQueryClient()
  const [opened, { open, close }] = useDisclosure()

  const mutation = useMutation({
    mutationFn: async () => callService(poemsDeletePoem, { path: { poem_id: poem_id } }),
    onSuccess: () => {
      handleSuccess()
      close()
    },
    onError: (error) => {
      handleError(error as any)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['poems'] })
      queryClient.invalidateQueries({ queryKey: ['authors'] })
    }
  })

  const deletePoem = async () => {
    try {
      await mutation.mutateAsync()
    } catch {
      // error is handled by deleteAuthor
    }
  }

  return (
    <>
      {icon ? (
        <ActionIcon color="red" onClick={open}>
          <TbTrash />
        </ActionIcon>
      ) : (
        <Button
          color="red"
          onClick={open}
        >
          Eliminar poema
        </Button>
      )}
      <Modal
        opened={opened}
        onClose={close}
        title="Eliminar poema"
        ta="left"
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
          <Button onClick={deletePoem} color="red" loading={mutation.isPending} loaderProps={{type: 'dots'}}>
            Eliminar
          </Button>
        </Group>
      </Modal>
    </>
  )
}