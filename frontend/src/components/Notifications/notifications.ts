import classes from "./notifications.module.css"

export const errorNotification = (errorMessage: string) => ({
    title: 'Error',
    message: errorMessage,
    autoClose: 10000,
    color: 'red',
    classNames: classes,
})

export const successNotification = {
    color: 'green',
    title: 'Éxito',
    message: 'La operación se ha completado!',
    classNames: classes,
}