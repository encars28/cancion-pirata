import { TbCheck, TbX } from "react-icons/tb"
import React from "react";

export const errorNotification = ({ title, description }: { title?: string; description?: string}) => ({
    title: title || 'Error',
    message: description || 'Ha ocurrido un error inesperado.',
    autoClose: 10000,
    color: 'red',
    icon: React.createElement(TbX, {size: 18})
})

export const successNotification = ({title, description}: {title?: string, description?: string})  => ({
    color: 'green',
    title: title || 'Éxito',
    message: description || 'La operación se ha completado!',
    icon: React.createElement(TbCheck, {size: 18}),
})