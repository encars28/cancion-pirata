import { usersDeleteUserMe, usersGetUserMeProfilePicture, usersGetUserProfilePicture, usersUpdateUserProfilePicture } from '../client'
import { callService, showError, showSuccess } from '../utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import useAuth from './useAuth'
import { notifications } from '@mantine/notifications'

const useUserActions = (userId?: string) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const { data: profilePicture } = useQuery({
    queryKey: ['currentUser', 'profilePicture'],
    queryFn: async () => callService(usersGetUserMeProfilePicture),
  })

  const { data: userProfilePicture } = useQuery({
    queryKey: ['users', userId, 'profilePicture'],
    queryFn: async () => {
      return callService(usersGetUserProfilePicture, { path: { user_id: userId! } })
    },
  })



const updateProfilePicture = useMutation({
    mutationFn: async (file: File) => {
      return callService(usersUpdateUserProfilePicture, { body: { image: file } })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] })
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
    onSuccess: () => {
      notifications.clean()
      showSuccess()
    },
    onError: (error) => {
      showError(error as any)
    }
  })

  const deleteUserMeMutation = useMutation({
    mutationFn: async () => callService(usersDeleteUserMe),
    onSuccess: () => {
      logout()
      navigate('/')
      showSuccess()
    },
    onError: (error) => {
      showError(error as any)
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
    profilePicture,
    updateProfilePicture, 
    userProfilePicture
  }
}

export default useUserActions