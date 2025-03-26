import { Form, isEmail, isNotEmpty, useForm } from '@mantine/form'
import { UserPublic, UserUpdateMe, usersUpdateUserMe } from '../../client';
import { TextInput, Stack, Button, Group } from '@mantine/core';
import { TbAbc, TbAt, TbUser } from 'react-icons/tb';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { callService, handleError, handleSuccess } from '../../utils';
import { HttpValidationError } from '../../client/types.gen';


export function UserData({ edit, user }: { edit: boolean, user: UserPublic }) {
  const form = useForm<UserUpdateMe>({
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

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (data: UserUpdateMe) => 
      callService(usersUpdateUserMe, { body: data }),
    onSuccess: () => {
      handleSuccess()
    },

    onError: (error: HttpValidationError) => {
      handleError(error)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await mutation.mutateAsync(values)
    } catch {
      // error is handled by mutation
      form.setErrors({ email: 'email o username inválido', username: 'email o username inválido' })
    }
  }

  return (
    <Form form={form} onSubmit={handleSubmit}>
        <Stack ta="left">
          <TextInput
            name='email'
            key={form.key('email')}
            label="Correo"
            placeholder="Correo"
            type="email"
            {...form.getInputProps('email')}
            rightSectionPointerEvents="none"
            rightSection={<TbAt size={15} />}
            readOnly={!edit}
          />
          <TextInput
            name='username'
            key={form.key('username')}
            label="Nombre de usuario"
            placeholder="Nombre de usuario"
            {...form.getInputProps('username')}
            rightSectionPointerEvents="none"
            rightSection={<TbUser size={15} />}
            readOnly={!edit}
          />
          <TextInput
            name='full_name'
            key={form.key('full_name')}
            label="Nombre completo"
            placeholder="Nombre"
            {...form.getInputProps('full_name')}
            rightSectionPointerEvents="none"
            rightSection={<TbAbc size={15} />}
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