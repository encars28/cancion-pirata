import { notifications } from '@mantine/notifications'
import { usersDeleteUser, usersUpdateUser, usersGetUserProfilePicture, usersUpdateUserProfilePicture } from '../client'
import { callService } from '../utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { successNotification } from '../notifications'
import { UserUpdate } from '../client/types.gen'

const useUserActions = (userId: string) => {
  const queryClient = useQueryClient()
  const { data: userProfilePicture } = useQuery({
    queryKey: ['users', userId, 'profilePicture'],
    queryFn: async () => {
      return callService(usersGetUserProfilePicture, { path: { user_id: userId! } })
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 48, // 48 hours
  })

  const updateUserProfilePicture = useMutation({
    mutationFn: async (file: File) => {
      return callService(usersUpdateUserProfilePicture, { body: { image: file }, path: { user_id: userId! } })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userId, 'profilePicture'] })
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async () => callService(usersDeleteUser, { path: { user_id: userId! } }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] })
    },
    onSuccess: () => {
      notifications.clean()
      notifications.show(successNotification({
        title: 'Usuario eliminado',
        description: 'El usuario ha sido eliminado correctamente.'
      }))
    }
  })

  const editUserMutation = useMutation({
    mutationFn: async (data: UserUpdate) =>
      callService(usersUpdateUser, { path: { user_id: userId }, body: data }),
    onSuccess: () => {
      notifications.clean()
      notifications.show(successNotification({ title: 'Usuario actualizado', description: 'El usuario ha sido actualizado correctamente.' }))
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })


  return {
    userProfilePicture,
    updateUserProfilePicture,
    deleteUserMutation,
    editUserMutation
  }
}

export default useUserActions