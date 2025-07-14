import { notifications } from '@mantine/notifications'
import { usersDeleteUser, usersUpdateUser, usersUpdateUserProfilePicture } from '../client'
import { callService } from '../utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { successNotification } from '../notifications'
import { UserUpdate } from '../client/types.gen'
import usePicture from './usePicture'

const useUserActions = (userId: string) => {
  const queryClient = useQueryClient()
  const { setUserProfilePicture } = usePicture()

  const updateUserProfilePicture = useMutation({
    mutationFn: async (file: File) => {
      return callService(usersUpdateUserProfilePicture, { body: { image: file }, path: { user_id: userId! } })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userId, 'profilePicture'] })
      setUserProfilePicture(import.meta.env.VITE_IMAGES_DIR + "/users/" + userId + ".png" + "?" + new Date().getTime())
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
    updateUserProfilePicture,
    deleteUserMutation,
    editUserMutation,
  }
}

export default useUserActions