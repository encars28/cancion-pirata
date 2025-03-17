import {
  Anchor,
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
import { handleError, handleSuccess } from '../../../utils';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

export function PasswordForm() {
  const navigate = useNavigate()
  const form = useForm<{email: string}>({
    mode: 'uncontrolled',
    validate: {
      email: isEmail("Correo inválido")
    },
    initialValues: {
      email: ''
    }
  })

  const mutation = useMutation({
    mutationFn: async (data: string) => {
      const response = await loginRecoverPassword({ path: { email: data } })
      if (response.error) {
        throw response.error
      }

      return response.data
    },
    onSuccess: () => {
      handleSuccess()
    },
    onError: (error: HttpValidationError) => {
      handleError(error)
    },
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
            onClick={() => navigate("/login")}
          >
            <Center inline>
              <TbArrowLeft size={15} />
              <Box ml={5}>Volver</Box>
            </Center>
          </UnstyledButton>
          <TextInput
            className={classes.input}
            name='email'
            key={form.key('email')}
            label="Email"
            placeholder="ejemplo@ejemplo.com"
            rightSectionPointerEvents="none"
            rightSection={<TbAt size={15} />}
            {...form.getInputProps('email')}
            required
          />
          <Group justify='flex-end'>
            <Button
              type="submit"
              className={classes.submit}
            >
              Enviar
            </Button>
          </Group>
        </Paper>
      </Form>
    </Flex>
  )
}