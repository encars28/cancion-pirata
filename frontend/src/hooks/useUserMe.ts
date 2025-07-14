import { useQueryClient, useMutation } from '@tanstack/react-query'
import { usersUpdateUserMeProfilePicture, usersDeleteUserMe, AuthorUpdateBasic, authorsUpdateAuthorMe, EmailToken, usersUpdateEmailMe } from '../client'
import { callService } from '../utils'
import { useNavigate } from 'react-router'
import useAuth from './useAuth'
import { notifications } from '@mantine/notifications'
import { successNotification } from '../notifications'
import useUserActions from './useUserActions'


const useUserMe = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { userProfilePicture } = useUserActions(user?.id!)

  const updateProfilePicture = useMutation({
    mutationFn: async (file: File) => {
      return callService(usersUpdateUserMeProfilePicture, { body: { image: file } })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
    onSuccess: () => {
      notifications.clean()
      notifications.show(successNotification({
        title: "Foto de perfil actualizada",
        description: "Tu foto de perfil ha sido actualizada correctamente."
      }))
      // setUserProfilePicture(import.meta.env.VITE_IMAGES_DIR + "/users/" + user?.id! + ".png" )
    }
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

  const editAuthorMe = useMutation({
    mutationFn: async (data: AuthorUpdateBasic) => callService(authorsUpdateAuthorMe, { body: data }),
    onSuccess: () => {
      notifications.clean()
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    }
  })

  const verifyEmailMutation = useMutation({
    mutationFn: async (token: EmailToken) => callService(usersUpdateEmailMe, { body: token }),
    onSuccess: () => {
      notifications.clean()
      notifications.show(successNotification({
        title: "Correo verificado",
        description: "Tu correo electrónico ha sido verificado correctamente."
      }))

      navigate('/')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  return { updateProfilePicture, deleteUserMeMutation, editAuthorMe, verifyEmailMutation, userProfilePicture }
}

export default useUserMe