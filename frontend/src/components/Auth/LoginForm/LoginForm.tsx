import {
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  Stack,
} from '@mantine/core';
import classes from './LoginForm.module.css';

import { TbAt } from "react-icons/tb";
import useAuth from '../../../hooks/useAuth';
import { useForm, isEmail } from '@mantine/form'
import { Form } from '@mantine/form';
import { useNavigate } from 'react-router';

export function LoginForm() {
  const { loginMutation } = useAuth()
  const navigate = useNavigate()

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
    },
    enhanceGetInputProps: () => ({
      disabled: loginMutation.isPending,
    }),

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
      <Title ta="center" className={classes.title}>
        Iniciar sesión
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        ¿No tienes cuenta?{' '}
        <Anchor onClick={() => navigate("/signup")} size="sm" component="button" disabled={loginMutation.isPending}>
          Regístrate
        </Anchor>
      </Text>
      <Form form={form} onSubmit={handleSubmit}>
        <Paper withBorder className={classes.paper}>
          <Stack gap="lg">
            <TextInput
              name='email'
              label="Email"
              placeholder="ejemplo@ejemplo.com"
              rightSectionPointerEvents="none"
              rightSection={<TbAt size={15} />}
              {...form.getInputProps('email')}
              key={form.key('email')}
              required
            />
            <PasswordInput
              name='password'
              label="Contraseña"
              placeholder="Tu contraseña"
              {...form.getInputProps('password')}
              key={form.key('password')}
              required
            />
          </Stack>
          <Button data-autoFocus fullWidth mt="xl" type='submit' loading={loginMutation.isPending} loaderProps={{ type: 'dots' }}>
            Iniciar sesión
          </Button>
        </Paper>
        <Text size="sm" ta="center" mt="xl">
        ¿Has olvidado tu contraseña?{' '}
        <Anchor onClick={() => navigate("/password-recovery")} component="button" size="sm" disabled={loginMutation.isPending}>
          Recuperar contraseña
        </Anchor>
      </Text>
      </Form>
    </Container>
  );
}