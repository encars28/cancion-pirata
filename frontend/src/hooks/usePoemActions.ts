import { callService, handleError, handleSuccess } from '../utils'
import { poemsDeletePoem } from '../client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import useAuth from './useAuth'

const usePoemActions = (poemId: string) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const {user: currentUser} = useAuth()

  const deletePoemMutation = useMutation({
    mutationFn: async () => callService(poemsDeletePoem, { path: { poem_id: poemId } }),
    onSuccess: () => {
      handleSuccess()
      if (currentUser?.is_superuser) {
        navigate('/admin')
      }
      else {
        navigate('/my')
      }
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