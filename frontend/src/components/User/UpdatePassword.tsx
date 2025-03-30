import {
  Stack,
  Button,
  PasswordInput,
  Title,
  Container,
} from '@mantine/core';
import { hasLength, useForm } from "@mantine/form";
import { Form } from "@mantine/form";
import { HttpValidationError, UpdatePassword, usersUpdatePasswordMe } from '../../client';
import { callService, handleError, handleSuccess } from '../../utils';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

export function UpdatePasswordForm() {
  const navigate = useNavigate()

  const form = useForm<UpdatePassword>({
    mode: 'uncontrolled',
    validate: {
      current_password: hasLength({ min: 8 }, 'La contraseña debe tener al menos 8 caracteres'),
      new_password: hasLength({ min: 8 }, 'La contraseña debe tener al menos 8 caracteres')
    },
    initialValues: {
      new_password: '',
      current_password: '',
    }
  })

  const mutation = useMutation({
    mutationFn: async (data: UpdatePassword) => {
      await callService(usersUpdatePasswordMe, { body: data })
    },
    onSuccess: () => {
      handleSuccess()
      navigate("/me")
    },
    onError: (error: HttpValidationError) => {
      handleError(error)
    },
  })

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await mutation.mutateAsync(values)
    } catch {
      form.setErrors({ current_password: 'Contraseña incorrecta' })
     }
  }

  return (
    <>
      <Title ta="center" m="xl" mt={60}>
        Cambiar contraseña
      </Title>
      <Container size={550}>
      <Form form={form} onSubmit={handleSubmit}>
        <Stack ta="left">
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
          >
            Cambiar contraseña
          </Button>
        </Stack>
      </Form>
      </Container>
    </>
  )
}