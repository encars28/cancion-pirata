import { usersDeleteUserMe } from '../client'
import { callService, handleError, handleSuccess } from '../utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import useAuth from './useAuth'

const useUserActions = (userId?: string) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const deleteUserMeMutation = useMutation({
    mutationFn: async () => callService(usersDeleteUserMe),
    onSuccess: () => {
      logout()
      navigate('/')
      handleSuccess()
    },
    onError: (error) => {
      handleError(error as any)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users']})
      queryClient.invalidateQueries({ queryKey: ['poems'] })
      queryClient.invalidateQueries({ queryKey: ['authors'] })
      queryClient.invalidateQueries({ queryKey: ['POD'] })
    }
  })

  return {
    deleteUserMeMutation,
  }
}

export default useUserActions