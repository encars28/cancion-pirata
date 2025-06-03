import {
  Stack,
  Button,
  PasswordInput,
  Title,
  Container,
  Paper
} from '@mantine/core';
import { hasLength, useForm } from "@mantine/form";
import { Form } from "@mantine/form";
import { HttpValidationError, UpdatePassword, usersUpdatePasswordMe } from '../../client';
import { callService, handleError, handleSuccess } from '../../utils';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { notifications } from '@mantine/notifications';

export function UpdatePasswordForm() {
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async (data: UpdatePassword) => {
      await callService(usersUpdatePasswordMe, { body: data })
    },
    onSuccess: () => {
      notifications.clean()
      handleSuccess()
      navigate("/me")
    },
    onError: (error: HttpValidationError) => {
      handleError(error)
    },
  })

  const form = useForm<UpdatePassword>({
    mode: 'uncontrolled',
    validate: {
      current_password: hasLength({ min: 8 }, 'La contraseña debe tener al menos 8 caracteres'),
      new_password: hasLength({ min: 8 }, 'La contraseña debe tener al menos 8 caracteres')
    },
    initialValues: {
      new_password: '',
      current_password: '',
    },
    enhanceGetInputProps: () => ({
      disabled: mutation.isPending,
    }),
  })



  const handleSubmit = async (values: typeof form.values) => {
    try {
      await mutation.mutateAsync(values)
    } catch {
      form.setErrors({ current_password: 'Contraseña incorrecta' })
     }
  }

  return (
    <Container size={550} h="100%" style={{ alignContent: "center" }}>
      <Paper withBorder shadow="md" p="xl" radius="lg">
      <Title ta="center" mb="xl">
        Cambiar contraseña
      </Title>
      <Form form={form} onSubmit={handleSubmit}>
        <Stack >
          <PasswordInput
            name='current_password'
            key={form.key('current_password')}
            label="Contraseña"
            placeholder="Tu contraseña"
            {...form.getInputProps('current_password')}
            required
          />
          <PasswordInput
            name='new_password'
            key={form.key('new_password')}
            label="Nueva contraseña"
            placeholder="Tu nueva contraseña"
            {...form.getInputProps('new_password')}
            required
          />
          <Button
            type="submit"
            mt="md"
            loading={mutation.isPending} 
            loaderProps={{type: 'dots'}}
          >
            Cambiar contraseña
          </Button>
        </Stack>
      </Form>
      </Paper>
      </Container>
  )
}