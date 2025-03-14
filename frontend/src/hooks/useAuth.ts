import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"

import { BodyLoginLoginAccessToken as AccessToken } from "../client/types.gen"
import { UserRegister } from "../client/types.gen"
import { handleError, getQuery } from "../utils"

import { usersReadUserMe, usersRegisterUser, loginLoginAccessToken } from "../client/sdk.gen"

const isLoggedIn = () => {
  return localStorage.getItem("access_token") !== null
}

const useAuth = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: user } = useQuery({
    ...getQuery("currentUser", usersReadUserMe),
    enabled: isLoggedIn(),
  })

  const signUpMutation = useMutation({
    mutationFn: (data: UserRegister) =>
      usersRegisterUser({body: data}),

    onSuccess: () => {
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
    const response = await loginLoginAccessToken({body: login_data})
    if (response.error) {
      throw response.error
    }

    localStorage.setItem("access_token", response.data.access_token)
    return response.data
  }

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigate("/")
    },
    onError: (error) => {
      handleError(error as any)
    },
  })

  const logout = () => {
    localStorage.removeItem("access_token")
    navigate("/login")
  }

  return {
    signUpMutation,
    loginMutation,
    logout,
    user,
  }
}

export { isLoggedIn }
export default useAuth