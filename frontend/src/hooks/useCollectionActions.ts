import { callService, showError, showSuccess } from '../utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { notifications } from '@mantine/notifications'
import {collectionsAddPoemToCollection, collectionsDeleteCollection, collectionsRemovePoemFromCollection, collectionsUpdateCollection, CollectionUpdate } from '../client'
import useAuth from './useAuth'
import { modals } from '@mantine/modals'

const useCollectionActions = (collectionId: string) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const editCollectionMutation = useMutation({
    mutationFn: async (data: CollectionUpdate) =>
      callService(collectionsUpdateCollection, { path: { collection_id: collectionId }, body: data }),
    onSuccess: () => {
      notifications.clean()
      showSuccess()
      navigate(`/collections/${collectionId}`)
    },
    onError: (error) => {
      showError(error as any)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      queryClient.invalidateQueries({ queryKey: ['users', currentUser?.id] })
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    }
  })

    const addPoemToCollection = useMutation({
    mutationFn: async (poemId: string) =>
      callService(collectionsAddPoemToCollection, {
        path: { collection_id: collectionId, poem_id: poemId },
      }),
    onSuccess: () => {
      showSuccess();
      modals.closeAll();
    },
    onError: (error) => {
      showError(error as any);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });

  const removePoemFromCollection = useMutation({
    mutationFn: async (poemId: string) =>
      callService(collectionsRemovePoemFromCollection, { path: { collection_id: collectionId, poem_id: poemId } }),
    onSuccess: () => {
      showSuccess()
    },
    onError: (error) => {
      showError(error as any)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    }
  })

  const deleteCollectionMutation = useMutation({
    mutationFn: async () => callService(collectionsDeleteCollection, { path: { collection_id: collectionId } }),
    onSuccess: () => {
      showSuccess()
      navigate(`/users/${currentUser?.id}`)
    },
    onError: (error) => {
      showError(error as any)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      queryClient.invalidateQueries({ queryKey: ['poems'] })
      queryClient.invalidateQueries({ queryKey: ['users', currentUser?.id] })
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    }
  })


  return {
    editCollectionMutation,
    deleteCollectionMutation,
    removePoemFromCollection,
    addPoemToCollection
  }

}

export default useCollectionActions