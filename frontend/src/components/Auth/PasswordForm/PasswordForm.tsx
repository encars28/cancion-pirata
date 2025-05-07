import {
  Box,
  Button,
  Center,
  Flex,
  Group,
  Paper,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { isEmail, useForm } from "@mantine/form";
import { TbArrowLeft, TbAt } from "react-icons/tb";
import classes from "./PasswordForm.module.css"
import { Form } from "@mantine/form";
import { HttpValidationError, loginRecoverPassword } from '../../../client';
import { callService, handleError, handleSuccess } from '../../../utils';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { notifications } from '@mantine/notifications';

export function PasswordForm() {
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async (data: string) =>
      callService(loginRecoverPassword, { path: { email: data } }),
    onSuccess: () => {
      notifications.clean()
      handleSuccess()
    },
    onError: (error: HttpValidationError) => {
      handleError(error)
    }
  })

  const form = useForm<{ email: string }>({
    mode: 'uncontrolled',
    validate: {
      email: isEmail("Correo inválido")
    },
    initialValues: {
      email: ''
    },
    enhanceGetInputProps: () => ({
      disabled: mutation.isPending,
      className: classes.input,
    }),

  })

  const handleSubmit = async () => {
    try {
      const { email } = form.getValues()
      await mutation.mutateAsync(email)
    } catch {
      form.setErrors({ email: 'Correo incorrecto' })
    }
  }

  return (
    <Flex
      justify="center"
      align="center"
      h="80%"
    >
      <Form form={form} onSubmit={handleSubmit}>
        <Title className={classes.title} ta="center">
          ¿Olvidaste tu contraseña?
        </Title>
        <Text c="dimmed" fz="md" ta="center">
          Introduce tu email
        </Text>
        <Paper withBorder className={classes.paper}>
          <UnstyledButton
            className={classes.return}
            disabled={mutation.isPending}
            onClick={() => navigate("/login")}
          >
            <Center inline>
              <TbArrowLeft size={15} />
              <Box ml={5}>Volver</Box>
            </Center>
          </UnstyledButton>
          <TextInput
            name='email'
            label="Email"
            placeholder="ejemplo@ejemplo.com"
            rightSectionPointerEvents="none"
            rightSection={<TbAt size={15} />}
            key={form.key('email')}
            {...form.getInputProps('email')}
            required
          />
          <Group justify='flex-end'>
            <Button
              type="submit"
              className={classes.submit}
              loading={mutation.isPending}
              loaderProps={{ type: 'dots' }}
            >
              Enviar
            </Button>
          </Group>
        </Paper>
      </Form>
    </Flex>
  )
}