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

import useAuth from '../../../hooks/useAuth';
import { isNotEmpty, useForm } from '@mantine/form'
import { Form } from '@mantine/form';
import { useNavigate, useSearchParams } from 'react-router';
import { Loading } from '../../Loading';

interface FormValues {
  login: string;
  password: string;
}

export function LoginForm() {
  const { loginMutation } = useAuth()
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()
  const token = searchParams.get("token");
  const { activateAccountMutation: activateAccount } = useAuth()

  if (token) {
    activateAccount.mutate({ token: token });
    if (activateAccount.isPending) {
      return <Loading />
    }
  }

  // Form validation
  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: {
      login: '',
      password: ''
    },
    validate: {
      login: isNotEmpty('Email o nombre de usuario es requerido'),
      password: isNotEmpty('Contraseña es requerida'),
    },
    enhanceGetInputProps: () => ({
      disabled: loginMutation.isPending,
    }),

  })

  // Form submission
  const handleSubmit = async () => {
    const { login, password } = form.getValues()

    try {
      await loginMutation.mutateAsync({ username: login, password: password });
    } catch {
      form.setErrors({ login: 'Datos incorrectos', password: 'Datos incorrectos' })
    }
  }

  return (
    <Container size={420}>
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
              name='login'
              label="Email o nombre de usuario"
              placeholder="ejemplo@ejemplo.com"
              {...form.getInputProps('login')}
              key={form.key('login')}
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