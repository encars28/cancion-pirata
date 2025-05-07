import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { BodyLoginLoginAccessToken as AccessToken } from "../client/types.gen"
import { UserRegister} from "../client/types.gen"
import { handleError, handleSuccess, callService } from "../utils"
import { client } from "../client/client.gen"
import { usersReadUserMe, usersRegisterUser, loginLoginAccessToken } from "../client/sdk.gen"
import { notifications } from "@mantine/notifications"

const isLoggedIn = () => {
  return localStorage.getItem("access_token") !== null
}

const useAuth = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => callService(usersReadUserMe),
    enabled: isLoggedIn(),
  })

  const signUpMutation = useMutation({
    mutationFn: async (data: UserRegister) => callService(usersRegisterUser, { body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      notifications.clean()
      handleSuccess()
      navigate("/login")
    },
    onError: (error) => {
      handleError(error as any)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const login = async (login_data: AccessToken) => {
    const response = await loginLoginAccessToken({ body: login_data })
    if (response.error) {
      throw response.error
    }

    client.setConfig({
      headers: {
        "Authorization": `Bearer ${response.data.access_token}`
      }
    })
    localStorage.setItem("access_token", response.data.access_token)
    return response.data
  }

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      notifications.clean()
      navigate("/")
    },
    onError: (error) => {
      handleError(error as any)
    },
  })

  const logout = () => {
    localStorage.removeItem("access_token")
    client.setConfig({ headers: { "Authorization": "" } })
    isLoggedIn() // Temporary solution to force refresh
    navigate("/login")
  }

  return {
    signUpMutation,
    loginMutation,
    logout,
    user,
  }
}

const isAdmin = () => {
  if (!isLoggedIn()) return false

  const { user } = useAuth()
  console.log(user?.is_superuser)
  return user?.is_superuser ?? false
}

export { isLoggedIn, isAdmin }
export default useAuth