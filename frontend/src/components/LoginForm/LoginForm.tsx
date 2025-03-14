import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  Stack,
} from '@mantine/core';
import classes from './LoginForm.module.css';

import { IconAt } from '@tabler/icons-react';
import useAuth from '../../hooks/useAuth';
import { useForm, isEmail } from '@mantine/form'
import { Form } from '@mantine/form';

export function LoginForm() {
  const { loginMutation } = useAuth()

  interface FormValues {
    email: string;
    password: string;
  }

  // Form validation
  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    validate: {
      email: isEmail('Correo inválido')
    },
    initialValues: {
      email: '',
      password: ''
    }
  })

  // Form submission
  const handleSubmit = async () => {
    const { email, password } = form.getValues()

    try {
      await loginMutation.mutateAsync({ username: email, password: password });
    } catch {
      // error is handled by loginMutation
      form.setErrors({ email: 'Email o contraseña incorrecto', password: 'Email o contraseña incorrecto' })
    }
  }

  return (
    <Container size={420} my={80}>
      <Form form={form} onSubmit={handleSubmit}>
        <Title ta="center" className={classes.title}>
          Iniciar sesión
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          ¿No tienes cuenta?{' '}
          <Anchor size="sm" component="button">
            Regístrate
          </Anchor>
        </Text>

        <Paper withBorder className={classes.paper}>
          <Stack gap="lg">
            <TextInput
              name='email'
              key={form.key('email')}
              label="Email"
              placeholder="ejemplo@ejemplo.com"
              rightSectionPointerEvents="none"
              rightSection={<IconAt size={15} />}
              {...form.getInputProps('email')}
              required
            />
            <PasswordInput
              name='password'
              key={form.key('password')}
              label="Contraseña"
              placeholder="Tu contraseña"
              {...form.getInputProps('password')}
              required
            />
          </Stack>
          <Group justify="space-between" mt="lg">
            <Checkbox label="Recuérdame" />
            <Anchor component="button" size="sm">
              ¿Olvidaste tu contraseña?
            </Anchor>
          </Group>
          <Button fullWidth mt="xl" type='submit'>
            Iniciar sesión
          </Button>
        </Paper>
      </Form>
    </Container>
  );
}