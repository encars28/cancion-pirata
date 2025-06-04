import { notifications } from "@mantine/notifications"
import { RequestResult } from "@hey-api/client-fetch";
import { errorNotification, successNotification } from "./components/Notifications/notifications";
import { HttpValidationError } from "./client";

export enum PoemType {
  TRANSLATION = 0,
  VERSION = 1,
}

export const showError = (error: HttpValidationError | string) => {
  if (typeof error === "string") {
    notifications.show(errorNotification(error))
    return
  }
  
  let errorMessage: string
  if (Array.isArray(error.detail) && error.detail.length > 0) {
    errorMessage = error.detail[0].msg

  } else {
    errorMessage = error.detail as any || "Algo no huele bien..."

  }

  notifications.show(errorNotification(errorMessage || "Algo no huele bien..."))
}

export const showSuccess = (message?: string) => {
  notifications.show(successNotification(message))
}

export class FetchError extends Error {
  constructor(public res: Response, message?: string) {
    super(message);
  }
}

export function handleFetchError(error: FetchError) {
  if (error.res.status === 401 || error.res.status === 403) {
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  }

}

export async function callService<R, E, P = undefined>(
  service: P extends undefined ? () => RequestResult<R, E> : (params: P) => RequestResult<R, E>,
  ...args: (P extends undefined ? [] : [P])
): Promise<R> {
  const result = await (service as any)(args[0]);
  if (result.error) {
    throw new FetchError(result.response)
  }

  return result.data;
}

