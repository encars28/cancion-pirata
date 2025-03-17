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
  Flex,
  SimpleGrid,
  Grid,
} from '@mantine/core';
import classes from './RegisterForm.module.css';

import { TbAt, TbWriting } from "react-icons/tb";
import useAuth from '../../../hooks/useAuth';
import { useForm, isEmail } from '@mantine/form'
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
      email: isEmail('Correo inválido')
    },
    initialValues: {
      email: '',
      password: '',
      username: '',
      full_name: '',
    }
  })

  // Form submission
  const handleSubmit = async () => {
    try {
      await signUpMutation.mutateAsync(form.getValues());
    } catch {
      // error is handled by loginMutation
      // form.setErrors()
    }
  }

  return (
    <Container my={80} size={750}>
      <Form form={form} onSubmit={handleSubmit}>
        <Title ta="center" className={classes.title}>
          Regístrate
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          ¿Ya tienes cuenta?{' '}
          <Anchor onClick={() => navigate("/login")} size="sm" component="button">
            Iniciar sesión
          </Anchor>
        </Text>

        <Paper withBorder className={classes.paper}>
          <Grid grow gutter="lg">
            <Grid.Col span={12}>
              <TextInput
                name='full_name'
                key={form.key('full_name')}
                label="Nombre completo"
                placeholder="Tu nombre"
                {...form.getInputProps('full_name')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>

              <TextInput
                name='email'
                key={form.key('email')}
                label="Email"
                placeholder="ejemplo@ejemplo.com"
                rightSectionPointerEvents="none"
                rightSection={<TbAt size={15} />}
                {...form.getInputProps('email')}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <PasswordInput
                name='password'
                key={form.key('password')}
                label="Contraseña"
                placeholder="Tu contraseña"
                {...form.getInputProps('password')}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                name='username'
                key={form.key('username')}
                label="Nombre de usuario"
                placeholder="Tu nombre de usuario"
                rightSectionPointerEvents="none"
                rightSection={<TbWriting size={15} />}
                {...form.getInputProps('username')}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }} >
              <Button fullWidth mt={25}type='submit'>
                Crear cuenta
              </Button>
            </Grid.Col>
          </Grid>
        </Paper>
      </Form>
    </Container>
  );
}