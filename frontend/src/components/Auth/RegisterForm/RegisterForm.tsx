import {
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  Grid,
} from '@mantine/core';
import classes from './RegisterForm.module.css';

import { TbAbc, TbAt, TbUser } from "react-icons/tb";
import useAuth from '../../../hooks/useAuth';
import { useForm, isEmail, hasLength, isNotEmpty } from '@mantine/form'
import { Form } from '@mantine/form';
import { useNavigate } from 'react-router';
import { UserRegister } from '../../../client';

export function RegisterForm() {
  const { signUpMutation } = useAuth()
  const navigate = useNavigate()

  // Form validation
  const form = useForm<UserRegister>({
    mode: 'uncontrolled',
    validate: {
      email: isEmail('Correo inválido'),
      password: hasLength({ min: 8 }, 'La contraseña debe tener al menos 6 caracteres'),
      username: isNotEmpty('El nombre de usuario no es válido'),
    },
    initialValues: {
      email: '',
      password: '',
      username: '',
      full_name: '',
    },
    enhanceGetInputProps: () => ({
      disabled: signUpMutation.isPending,
    }),
  })

  // Form submission
  const handleSubmit = async () => {
    const values = form.getValues()

    if (values.full_name != undefined) {
      values.full_name = values.full_name.trim()
      if (values.full_name === '') {
        values.full_name = undefined
      }
    }

    try {
      await signUpMutation.mutateAsync(values);
    } catch {
      // error is handled by loginMutation
      form.setErrors({ email: "Correo incorrecto o usuario incorrecto", username: "Correo incorrecto o usuario incorrecto" })
    }
  }

  return (
    <Container my={80} maw={{ base: 420, sm: 700, md: 800 }}>
      <Title ta="center" className={classes.title}>
        Regístrate
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        ¿Ya tienes cuenta?{' '}
        <Anchor onClick={() => navigate("/login")} size="sm" component="button" disabled={signUpMutation.isPending}>
          Iniciar sesión
        </Anchor>
      </Text>
      <Form form={form} onSubmit={handleSubmit}>
        <Paper withBorder className={classes.paper}>
          <Grid grow gutter="lg">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                name='full_name'
                label="Nombre completo"
                placeholder="Tu nombre"
                rightSectionPointerEvents="none"
                rightSection={<TbAbc size={15} />}
                key={form.key('full_name')}
                {...form.getInputProps('full_name')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>

              <TextInput
                name='username'
                label="Nombre de usuario"
                placeholder="Tu nombre de usuario"
                rightSectionPointerEvents="none"
                rightSection={<TbUser size={15} />}
                key={form.key('username')}
                {...form.getInputProps('username')}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
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
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <PasswordInput
                name='password'
                label="Contraseña"
                placeholder="Tu contraseña"
                key={form.key('password')}
                {...form.getInputProps('password')}
                required
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Button fullWidth mt={30} type='submit' loading={signUpMutation.isPending} loaderProps={{ type: 'dots' }}>
                Crear cuenta
              </Button>
            </Grid.Col>
          </Grid>
        </Paper>
      </Form>
    </Container>
  );
}