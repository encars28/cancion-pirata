import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { BodyLoginLoginAccessToken as AccessToken, VerifyToken } from "../client/types.gen"
import { UserRegister} from "../client/types.gen"
import { callService } from "../utils"
import { client } from "../client/client.gen"
import { usersReadUserMe, usersRegisterUser, loginLoginAccessToken, loginActivateAccount } from "../client/sdk.gen"
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
    const token = await callService(loginLoginAccessToken, { body: login_data })

    client.setConfig({
      headers: {
        "Authorization": `Bearer ${token?.access_token}`
      }
    })
    localStorage.setItem("access_token", `${token?.access_token}`)
    return token
  }

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      notifications.clean()
      location.reload()
      location.href = "/"
    },
  })

  const logout = () => {
    localStorage.removeItem("access_token")
    client.setConfig({ headers: { "Authorization": "" } })
    location.reload()
    location.href = "/login"
    notifications.clean()
    notifications.show(successNotification({
      title: "Sesión cerrada",
      description: "La sesión se ha cerrado correctamente.",
    }))
  }

  const activateAccountMutation = useMutation({
    mutationFn: async (token: VerifyToken) => callService(loginActivateAccount, { body: token }),
    onSuccess: () => {
      notifications.clean()
      notifications.show(successNotification({
        title: "Cuenta activada",
        description: "Tu cuenta ha sido activada correctamente. Ya puedes iniciar sesión.",
      }))

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
  }
}

export { isLoggedIn, isAdmin }
export default useAuth