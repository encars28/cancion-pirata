import { usersDeleteUserMe, usersGetUserMeProfilePicture, usersGetUserProfilePicture, usersUpdateUserProfilePicture } from '../client'
import { callService } from '../utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import useAuth from './useAuth'
import { notifications } from '@mantine/notifications'
import { successNotification } from '../notifications'

const useUserActions = (userId?: string) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const { data: profilePicture } = useQuery({
    queryKey: ['currentUser', 'profilePicture'],
    queryFn: async () => callService(usersGetUserMeProfilePicture),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 48, // 48 hours
  })

  const { data: userProfilePicture } = useQuery({
    queryKey: ['users', userId, 'profilePicture'],
    queryFn: async () => {
      return callService(usersGetUserProfilePicture, { path: { user_id: userId! } })
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 48, // 48 hours
  })

  const updateProfilePicture = useMutation({
    mutationFn: async (file: File) => {
      return callService(usersUpdateUserProfilePicture, { body: { image: file } })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] })
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })

  const deleteUserMeMutation = useMutation({
    mutationFn: async () => callService(usersDeleteUserMe),
    onSuccess: () => {
      logout()
      navigate('/')
      notifications.show(successNotification({
        title: "Cuenta eliminada",
        description: "Tu cuenta ha sido eliminada correctamente. Lamentamos que te vayas."
      }))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
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