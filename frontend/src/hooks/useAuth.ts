import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { BodyLoginLoginAccessToken as AccessToken, VerifyToken } from "../client/types.gen"
import { UserRegister} from "../client/types.gen"
import { callService } from "../utils"
import { client } from "../client/client.gen"
import { usersReadUserMe, usersRegisterUser, loginLoginAccessToken, loginActivateAccount, usersGetUserMeProfilePicture } from "../client/sdk.gen"
import { notifications } from "@mantine/notifications"
import { successNotification } from "../notifications"

const isLoggedIn = () => {
  return localStorage.getItem("access_token") !== null
}

const isAdmin = () => {
  if (!isLoggedIn()) return false
  const token = JSON.parse(atob(localStorage.getItem("access_token")?.split(".")[1]!))
  return token.is_admin
}

const useAuth = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => callService(usersReadUserMe),
    enabled: isLoggedIn(),
  })

  const { data: profilePicture } = useQuery({
    queryKey: ['currentUser', 'profilePicture'],
    queryFn: async () => callService(usersGetUserMeProfilePicture),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 48, // 48 hours
  })

  const signUpMutation = useMutation({
    mutationFn: async (data: UserRegister) => callService(usersRegisterUser, { body: data }),
    onSuccess: () => {
      notifications.clean()
      notifications.show(successNotification({
        title: "Usuario registrado",
        description: "Revisa tu correo electrónico y sigue las instrucciones para activar tu cuenta.",
      }))
      navigate("/login")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
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
      location.reload()
      navigate("/")
    },
  })

  const logout = () => {
    localStorage.removeItem("access_token")
    client.setConfig({ headers: { "Authorization": "" } })
    location.reload()
    navigate("/login")
    notifications.clean()
    notifications.show({
      title: "Sesión cerrada",
      message: "Has cerrado sesión correctamente.",
      color: "green",
    })
  }

  const activateAccountMutation = useMutation({
    mutationFn: async (token: VerifyToken) => callService(loginActivateAccount, { body: token }),
    onSuccess: () => {
      notifications.clean()
      notifications.show({
        title: "Cuenta activada",
        message: "Tu cuenta ha sido activada correctamente. Ya puedes iniciar sesión.",
        color: "green",
      })

      navigate("/login")
    }
    ,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      queryClient.invalidateQueries({ queryKey: ["users"] })
    }
  })


  return {
    signUpMutation,
    loginMutation,
    logout,
    user,
    activateAccountMutation,
    profilePicture,
  }
}

export { isLoggedIn, isAdmin }
export default useAuth