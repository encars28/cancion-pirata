import { notifications } from "@mantine/notifications"
import { HttpValidationError } from "./client/types.gen"
import { RequestResult } from "@hey-api/client-fetch";
import { errorNotification, successNotification } from "./components/Notifications/notifications";

export const handleError = (error: HttpValidationError) => {
  let errorMessage: string
  if (Array.isArray(error.detail) && error.detail.length > 0) {
    errorMessage = error.detail[0].msg

  } else {
    errorMessage = error.detail as any || "Algo no huele bien..."

  }

  notifications.show(errorNotification(errorMessage))
}

export const handleSuccess = () => {
  notifications.show(successNotification)
}

export async function callService<R, E, P = undefined>(
  service: P extends undefined ? () => RequestResult<R, E> : (params: P) => RequestResult<R, E>,
  ...args: (P extends undefined ? [] : [P])
): Promise<R> {
  const result = await (service as any)(args[0]);
  if (result.error) {
    throw result.error;
  }

  return result.data;
}