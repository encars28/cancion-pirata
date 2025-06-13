import {
  Stack,
  Button,
  Paper,
  PasswordInput,
  Text,
  Title,
  Center,
} from '@mantine/core';
import { hasLength, useForm } from "@mantine/form";
import classes from "./ResetPassword.module.css"
import { Form } from "@mantine/form";
import { NewPassword, loginResetPassword } from '../../../client';
import { callService } from '../../../utils';
import { useMutation } from '@tanstack/react-query';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { notifications } from '@mantine/notifications';
import { errorNotification, successNotification } from '../../../notifications';

interface ResetPasswordForm extends NewPassword {
  confirm_password: string
}

export function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const resetPassword = async (data: NewPassword) => {
    const token = searchParams.get("token")
    if (!token) {
      notifications.show(errorNotification({
        title: "Error al cambiar la contraseña",
        description: "No se ha proporcionado un token de recuperación. Por favor, asegúrate de que el enlace es correcto.",
      }))

      return <Navigate to="/" replace />
    }

    await callService(loginResetPassword, { body: { new_password: data.new_password, token: token } })
  }

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      notifications.clean()
      notifications.show(successNotification({
        title: "Contraseña cambiada",
        description: "Tu contraseña ha sido cambiada correctamente. Ahora puedes iniciar sesión con la contraseña nueva.",}))
      navigate("/login")
    },
  })

  const form = useForm<ResetPasswordForm>({
    mode: 'uncontrolled',
    validate: {
      new_password: hasLength({ min: 8 }, 'La contraseña debe tener al menos 8 caracteres'),
      confirm_password: (value, values) => {
        if (value !== values.new_password) {
          return 'Las contraseñas no coinciden'
        }
      }
    },
    initialValues: {
      new_password: '',
      confirm_password: '',
      token: '',
    },
    enhanceGetInputProps: () => ({
      disabled: mutation.isPending,
    }),
  })

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await mutation.mutateAsync(values)
    } catch { }
  }

  return (
    <Center>
      <Form form={form} onSubmit={handleSubmit}>
        <Title className={classes.title} ta="center">
          Recuperar contraseña
        </Title>
        <Text c="dimmed" fz="md" ta="center">
          Introduce tu nueva contraseña
        </Text>
        <Paper withBorder className={classes.paper}>
          <Stack>
            <PasswordInput
              name='new_password'
              label="Contraseña"
              placeholder="Tu contraseña"
              {...form.getInputProps('new_password')}
              key={form.key('new_password')}
              required
            />
            <PasswordInput
              name='confirm_password'
              label="Confirma tu contraseña"
              placeholder="Tu contraseña"
              {...form.getInputProps('confirm_password')}
              key={form.key('confirm_password')}
              required
            />
            <Button
              type="submit"
              mt="md"
              loading={mutation.isPending}
              loaderProps={{ type: 'dots' }}	
            >
              Cambiar contraseña
            </Button>
          </Stack>
        </Paper>
      </Form>
    </Center>
  )
}