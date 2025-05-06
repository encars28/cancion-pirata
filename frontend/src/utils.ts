import { notifications } from "@mantine/notifications"
import { AuthorPublicBasic, HttpValidationError, PoemPublicBasic, UserPublic } from "./client/types.gen"
import classes from "./notifications.module.css"
import { RequestResult } from "@hey-api/client-fetch";
import useAuthors  from "./hooks/useAuthors";
import usePoems  from "./hooks/usePoems";
import useAuth from "./hooks/useAuth";
import { usersReadUsers } from "./client";
import { useQuery } from "@tanstack/react-query";

export const handleError = (error: HttpValidationError) => {
  let errorMessage: string
  if (Array.isArray(error.detail) && error.detail.length > 0) {
    errorMessage = error.detail[0].msg

  } else {
    errorMessage = error.detail as any || "Algo no huele bien..."

  }

  notifications.show({
    color: 'red',
    title: 'Error',
    message: errorMessage,
    classNames: classes,
    autoClose: 7000,
  })
}

export const handleSuccess = () => {
  notifications.show({
    color: 'green',
    title: 'Éxito',
    message: 'La operación se ha completado!',
    classNames: classes,
  })
}

export async function callService<R, E, P=undefined>(
  service: P extends undefined ? () => RequestResult<R, E> : (params: P) => RequestResult<R, E>,
  ...args: (P extends undefined ? [] : [P])
): Promise<R> {
  const result = await (service as any)(args[0]);
  if (result.error) {
    throw result.error;
  }

  return result.data;
}

export function createSearchData() {
  const { data: poemsData } = usePoems({})
  const { data: authorsData } = useAuthors({})
  const { user } = useAuth()

  const { data: usersData } = useQuery(
    {
      queryKey: ['users'],
      queryFn: async () => callService(usersReadUsers),
      placeholderData: (prevData) => prevData,
    })

  const users: UserPublic[] = usersData?.data ?? []

  const poems: PoemPublicBasic[] = poemsData?.data ?? []
  const authors: AuthorPublicBasic[] = authorsData?.data ?? []

  const data =  authors.map(
    (author) => ({
      label: author.full_name,
      description: "Autor",
      url: `/authors/${author.id}`
    })).concat(
  poems.map(
    (poem) => ({
      label: poem.title,
      description: "Poema",
      url: `/poems/${poem.id}`
  })))

  if (user?.is_superuser) {
    // TODO: Change the url to the user profile
    data.push(...users.map(
      (user) => ({
        label: user.username,
        description: "Usuario",
        url: "/"
    })))
  }
  return data
}