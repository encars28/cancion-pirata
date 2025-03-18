import { notifications } from "@mantine/notifications"
import { HttpValidationError } from "./client/types.gen"
import classes from "./notifications.module.css"
import { RequestResult } from "@hey-api/client-fetch";

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
