import { authorsDeleteAuthor, authorsGetAuthorPicture, authorsUpdateAuthor, authorsUploadAuthorPicture, AuthorUpdate } from '../client'
import { callService } from '../utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import useAuth from './useAuth'
import { notifications } from '@mantine/notifications'
import { successNotification } from '../components/Notifications/notifications'

const useAuthorActions = (authorId: string) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const deleteAuthorMutation = useMutation({
    mutationFn: async () => callService(authorsDeleteAuthor, { path: { author_id: authorId } }),
    onSuccess: () => {
      notifications.show(successNotification({ title: 'Autor eliminado', description: 'El autor ha sido eliminado correctamente.' }))
      if (currentUser?.is_superuser) {
        navigate('/admin')
      }
      else {
        navigate('/my')
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['poems'] })
      queryClient.invalidateQueries({ queryKey: ['authors'] })
    }
  })

  const editAuthorMutation = useMutation({
    mutationFn: async (data: AuthorUpdate) =>
      callService(authorsUpdateAuthor, { path: { author_id: authorId }, body: data }),
    onSuccess: () => {
      notifications.clean()
      notifications.show(successNotification({
        title: 'Autor actualizado',
        description: 'El autor ha sido actualizado correctamente.',
      }))
      close()
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] })
    },
  })

  const updateProfilePicture = useMutation({
    mutationFn: async (file: File) => callService(authorsUploadAuthorPicture, {path: { author_id: authorId }, body: { file: file }}),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['authors', authorId] })
    }
  })

  const {data: AuthorProfilePicture} = useQuery({
    queryKey: ['authors', authorId, 'profilePicture'],
    queryFn: async () => callService(authorsGetAuthorPicture, { path: { author_id: authorId } }),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 48, // 48 hours
  })

  return {
    deleteAuthorMutation,
    editAuthorMutation,
    updateProfilePicture,
    AuthorProfilePicture,
  }
}

export default useAuthorActions