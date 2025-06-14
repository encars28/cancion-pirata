import { useQuery } from '@tanstack/react-query'
import { usersGetUserMeProfilePicture } from '../client'
import { callService } from '../utils'


const usePicture = () => {
    const { data: profilePicture } = useQuery({
        queryKey: ['currentUser', 'profilePicture'],
        queryFn: async () => callService(usersGetUserMeProfilePicture),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        gcTime: 1000 * 60 * 60 * 48, // 48 hours
    })
    return { profilePicture }
}

export default usePicture