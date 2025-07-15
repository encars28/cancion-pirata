import { callService } from '../utils'
import { poemsDeletePoem } from '../client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { notifications } from '@mantine/notifications'
import { successNotification } from '../notifications'

const usePoemActions = (poemId: string) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const deletePoemMutation = useMutation({
    mutationFn: async () => callService(poemsDeletePoem, { path: { poem_id: poemId } }),
    onSuccess: () => {
      notifications.show(successNotification({
        title: "Poema eliminado",
        description: "El poema se ha eliminado correctamente."
      }))
      navigate('/me')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['poems'] })
      queryClient.invalidateQueries({ queryKey: ['authors'] })
    }
  })

  return {
    deletePoemMutation
  }
}

export default usePoemActions