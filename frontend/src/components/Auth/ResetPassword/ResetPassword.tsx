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
import { HttpValidationError, NewPassword, loginResetPassword } from '../../../client';
import { callService, handleError, handleSuccess } from '../../../utils';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

interface ResetPasswordForm extends NewPassword {
  confirm_password: string
}

export function ResetPassword() {
  const navigate = useNavigate()

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
    }
  })

  const resetPassword = async (data: NewPassword) => {
    const token = new URLSearchParams(window.location.search).get("token")
    if (!token) {
      throw new Error("Token not found") // TODO: Handle error well 
    }

    await callService(loginResetPassword, { body: { new_password: data.new_password, token: token } })
  }

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      handleSuccess()
      navigate("/login")
    },
    onError: (error: HttpValidationError) => {
      handleError(error)
    },
  })

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await mutation.mutateAsync(values)
    } catch { }
  }

  return (
    <Center mt="xl">
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
              key={form.key('new_password')}
              label="Contraseña"
              placeholder="Tu contraseña"
              {...form.getInputProps('new_password')}
              required
            />
            <PasswordInput
              name='confirm_password'
              key={form.key('confirm_password')}
              label="Confirma tu contraseña"
              placeholder="Tu contraseña"
              {...form.getInputProps('confirm_password')}
              required
            />
            <Button
              type="submit"
              mt="md"
            >
              Cambiar contraseña
            </Button>
          </Stack>
        </Paper>
      </Form>
    </Center>
  )
}