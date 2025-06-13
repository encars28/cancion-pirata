import { Stack, ActionIcon, TextInput, PasswordInput, Modal, Group, Button, Checkbox, Select } from '@mantine/core';
import { Form, hasLength, isEmail, isNotEmpty, useForm } from '@mantine/form';
import { TbUser, TbAt, TbAbc, TbPencil } from "react-icons/tb";
import { AuthorPublicBasic, UserUpdate } from '../../client/types.gen';
import { callService } from '../../utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersUpdateUser } from '../../client';
import { useDisclosure } from '@mantine/hooks';
import { UserPublic } from '../../client/types.gen';
import { notifications } from '@mantine/notifications';
import useSearch from '../../hooks/useSearch';
import { successNotification } from '../../notifications';

export function EditUser({ user }: { user: UserPublic }) {
  const [opened, { open, close }] = useDisclosure()

  const { data: authorsData } = useSearch({search_type: ['author']})
  const authors = authorsData?.authors as AuthorPublicBasic[] ?? []
  const author_ids = authors.map(author => author.id) ?? []

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (data: UserUpdate) =>
      callService(usersUpdateUser, { path: { user_id: user.id }, body: data }),
    onSuccess: () => {
      notifications.clean()
      notifications.show(successNotification({}))
      close()
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const form = useForm<UserUpdate>({
    mode: 'uncontrolled',
    initialValues: {
      ...user,
    },
    validate: {
      email: isEmail('Correo electrónico inválido'),
      password: hasLength({ min: 8 }, 'La contraseña debe tener al menos 8 caracteres'),
      username: isNotEmpty('Nombre de usuario requerido'),
    },
    enhanceGetInputProps: () => ({
      disabled: mutation.isPending,
    }),
  })



  const handleSubmit = async () => {
    try {
      if (form.isDirty()) {
        const values = form.getValues()
        if (values.full_name === "") {
          values.full_name = undefined
        }

        await mutation.mutateAsync(values)
        form.resetDirty()
      }
    } catch {
      // error is handled by mutation
      form.setErrors({ email: 'Correo o usuario incorrecto', username: 'Correo o usuario incorrecto' })
    }
  }

  return (
    <>
      <ActionIcon variant="filled" onClick={open}>
        <TbPencil />
      </ActionIcon>
      <Modal
        opened={opened}
        onClose={close}
        title="Modificar usuario"
        overlayProps={{
          blur: 3,
        }}
        closeOnClickOutside={false}
        centered>
        <Form form={form} onSubmit={handleSubmit}>
          <Stack gap="lg"  m="md" p="sm">
            <TextInput
              name='email'
              key={form.key('email')}
              label="Email"
              placeholder="ejemplo@ejemplo.com"
              leftSectionPointerEvents="none"
              leftSection={<TbAt size={15} />}
              {...form.getInputProps('email')}
            />
            <PasswordInput
              name='password'
              key={form.key('password')}
              label="Contraseña"
              placeholder="Contraseña"
              {...form.getInputProps('password')}
            />
            <TextInput
              name='username'
              key={form.key('username')}
              label="Nombre de usuario"
              placeholder="Nombre de usuario"
              leftSectionPointerEvents="none"
              leftSection={<TbUser size={15} />}
              {...form.getInputProps('username')}
            />
            <TextInput
              name='full_name'
              key={form.key('full_name')}
              label="Nombre completo"
              placeholder="Nombre completo"
              leftSectionPointerEvents="none"
              leftSection={<TbAbc size={15} />}
              {...form.getInputProps('full_name')}
            />
            <Select
              searchable
              clearable
              name='author_id'
              key={form.key('author_id')}
              label="Autores"
              placeholder="Escribe para buscar un autor"
              data={author_ids}
              {...form.getInputProps('author_id')}
            />
            <Checkbox
              defaultChecked={user.is_superuser}
              key={form.key('is_superuser')}
              {...form.getInputProps('is_superuser')}
              label="Administrador"
            />
            <Group
              justify='flex-end'
              pt="lg"
            >
              <Button
                onClick={close}
                variant='outline'
              >
                Cancelar
              </Button>
              <Button
                variant='filled'
                type='submit'
                loading={mutation.isPending}
                loaderProps={{ type: 'dots' }}
              >
                Guardar
              </Button>
            </Group>
          </Stack>
        </Form>
      </Modal>
    </>
  )
}
