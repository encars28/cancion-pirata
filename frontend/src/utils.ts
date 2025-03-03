import { notifications } from "@mantine/notifications"
import { HttpValidationError } from "./client/types.gen"
import classes from "./notifications.module.css"

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
    autoClose: false,
  })
}

export const handleSuccess = () => {
  notifications.show({
    color: 'green',
    title: 'Éxito',
    message: 'Los datos ya están aquí 🎉',
    classNames: classes,
  })
}

export function getQuery(key: string, service: () => Promise<any>) {
  return {
    queryKey: [key],
    queryFn: async () => {
      const result = await service()
      if (result.error) {
        throw result.error;
      }

      return result.data;
    }
  }
}