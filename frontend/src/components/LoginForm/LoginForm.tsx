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

export function LoginForm() {
  return (
    <Container size={420} my={80}>
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
            label="Email"
            placeholder="ejemplo@ejemplo.com"
            rightSectionPointerEvents="none"
            rightSection={<IconAt size={15} />}
            // error="Email incorrecto"
            required
          />
          <PasswordInput
            label="Contraseña"
            placeholder="Tu contraseña"
            // error="Contraseña incorrecta"
            required
          />
        </Stack>
        <Group justify="space-between" mt="lg">
          <Checkbox label="Recuérdame" />
          <Anchor component="button" size="sm">
            ¿Olvidaste tu contraseña?
          </Anchor>
        </Group>
        <Button fullWidth mt="xl">
          Iniciar sesión
        </Button>
      </Paper>
    </Container>
  );
}