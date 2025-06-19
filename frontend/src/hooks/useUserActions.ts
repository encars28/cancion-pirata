import { usersGetUserProfilePicture, usersUpdateUserProfilePicture } from '../client'
import { callService } from '../utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

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



  return {
    userProfilePicture,
    updateUserProfilePicture
  }
}

export default useUserActions