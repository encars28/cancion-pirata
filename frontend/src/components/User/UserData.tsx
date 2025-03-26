import { Form, isEmail, isNotEmpty, useForm } from '@mantine/form'
import { UserPublic } from '../../client';
import { TextInput, Stack, Button, Group } from '@mantine/core';


export function UserData({ edit, user }: { edit: boolean, user: UserPublic }) {
  interface UserData {
    email: string;
    username: string;
    full_name?: string | null;
  }

  const form = useForm<UserData>({
    mode: 'uncontrolled',
    initialValues: {
      ...user,
    },
    validate: {
      email: isEmail('Correo inválido'),
      username: isNotEmpty('Nombre de usuario no puede estar vacío'),
      full_name: isNotEmpty('Nombre no puede estar vacío'),
    }
  });

  return (
    <Form form={form}>
      <Stack ta="left">
        <TextInput
          name='email'
          key={form.key('email')}
          label="Correo"
          placeholder="Correo"
          type="email"
          {...form.getInputProps('email')}
          readOnly={!edit}
        />
        <TextInput
          name='username'
          key={form.key('username')}
          label="Nombre de usuario"
          placeholder="Nombre de usuario"
          {...form.getInputProps('username')}
          readOnly={!edit}
        />
        <TextInput
          name='full_name'
          key={form.key('full_name')}
          label="Nombre"
          placeholder="Nombre"
          {...form.getInputProps('full_name')}
          readOnly={!edit}
        />
        {edit && (
          <Group
            justify='flex-end'
            mt="xl"
          >
            <Button
              type="submit"
            >
              Guardar
            </Button>
          </Group>
        )}
      </Stack>
    </Form>
  );
}