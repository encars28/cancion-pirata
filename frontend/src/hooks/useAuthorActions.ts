import { authorsDeleteAuthor, authorsGetAuthorPicture, authorsUpdateAuthor, authorsUploadAuthorPicture, AuthorUpdate, HttpValidationError } from '../client'
import { callService, handleError, handleSuccess } from '../utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import useAuth from './useAuth'
import { notifications } from '@mantine/notifications'

const useAuthorActions = (authorId: string) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const deleteAuthorMutation = useMutation({
    mutationFn: async () => callService(authorsDeleteAuthor, { path: { author_id: authorId } }),
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

  const editAuthorMutation = useMutation({
    mutationFn: async (data: AuthorUpdate) =>
      callService(authorsUpdateAuthor, { path: { author_id: authorId }, body: data }),
    onSuccess: () => {
      notifications.clean()
      handleSuccess()
      close()
    },

    onError: (error: HttpValidationError) => {
      handleError(error)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] })
    },
  })

  const updateProfilePicture = useMutation({
    mutationFn: async (file: File) => callService(authorsUploadAuthorPicture, {path: { author_id: authorId }, body: { file: file }}),
    onSuccess: () => {
      notifications.clean()
      handleSuccess()
    },
    onError: (error) => {
      handleError(error as any)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['authors', authorId] })
    }
  })

  const {data: AuthorProfilePicture} = useQuery({
    queryKey: ['authors', authorId, 'profilePicture'],
    queryFn: async () => callService(authorsGetAuthorPicture, { path: { author_id: authorId } }),
  })

  return {
    deleteAuthorMutation,
    editAuthorMutation,
    updateProfilePicture,
    AuthorProfilePicture,
  }
}

export default useAuthorActions