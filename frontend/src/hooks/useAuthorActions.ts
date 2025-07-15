import { authorsDeleteAuthor, authorsUpdateAuthor, authorsUploadAuthorPicture, AuthorUpdate } from '../client'
import { callService } from '../utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { notifications } from '@mantine/notifications'
import { successNotification } from '../notifications'

const useAuthorActions = (authorId: string) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const deleteAuthorMutation = useMutation({
    mutationFn: async () => callService(authorsDeleteAuthor, { path: { author_id: authorId } }),
    onSuccess: () => {
      notifications.show(successNotification({ title: 'Autor eliminado', description: 'El autor ha sido eliminado correctamente.' }))
      navigate('/')
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
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] })
    },
  })

  const updateProfilePicture = useMutation({
    mutationFn: async (file: File) => callService(authorsUploadAuthorPicture, {path: { author_id: authorId }, body: { file: file }}),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['authors', authorId] })
      notifications.show(successNotification({
        title: 'Foto de perfil actualizada',
        description: 'La foto de perfil del autor ha sido actualizada correctamente.',
      }))
    }
  })

  const authorProfilePicture = import.meta.env.VITE_IMAGES_DIR + "/authors/" + authorId + ".png"

  return {
    deleteAuthorMutation,
    editAuthorMutation,
    updateProfilePicture,
    authorProfilePicture
  }
}

export default useAuthorActions