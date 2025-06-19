import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { usersGetUserMeProfilePicture, usersUpdateUserMeProfilePicture, usersDeleteUserMe } from '../client'
import { callService } from '../utils'
import { useNavigate } from 'react-router'
import useAuth from './useAuth'
import { notifications } from '@mantine/notifications'
import { successNotification } from '../notifications'


const useUserMe = () => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const { logout } = useAuth()
    const { data: profilePicture } = useQuery({
        queryKey: ['currentUser', 'profilePicture'],
        queryFn: async () => callService(usersGetUserMeProfilePicture),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        gcTime: 1000 * 60 * 60 * 48, // 48 hours
    })
    const updateProfilePicture = useMutation({
        mutationFn: async (file: File) => {
            return callService(usersUpdateUserMeProfilePicture, { body: { image: file } })
        },
        onSettled: () => {
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
    return { profilePicture, updateProfilePicture, deleteUserMeMutation }
}

export default useUserMe