import { callService, handleError, handleSuccess } from '../utils'
import { poemsDeletePoem } from '../client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const usePoemActions = (poemId: string) => {
  const queryClient = useQueryClient()

  const deletePoemMutation = useMutation({
    mutationFn: async () => callService(poemsDeletePoem, { path: { poem_id: poemId } }),
    onSuccess: () => {
      handleSuccess()
    },
    onError: (error) => {
      handleError(error as any)
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