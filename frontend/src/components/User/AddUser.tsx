import { Stack, TextInput, PasswordInput, Modal, Group, Button, Checkbox } from '@mantine/core';
import { Form, hasLength, isEmail, isNotEmpty, useForm } from '@mantine/form';
import { TbUser, TbAt, TbAbc } from "react-icons/tb";
import { UserCreate } from '../../client/types.gen';
import { callService } from '../../utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersCreateUser } from '../../client';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { successNotification } from '../../notifications';

export function AddUser() {
  const [opened, { open, close }] = useDisclosure()

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (data: UserCreate) =>
      callService(usersCreateUser, { body: data }),
    onSuccess: () => {
      notifications.clean()
      notifications.show(successNotification({
        title: "Usuario creado",
        description: "El usuario se ha creado correctamente"
      }))
      close()
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    
  })

  const form = useForm<UserCreate>({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
      username: '',
      full_name: '',
      is_superuser: false,
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
      const values = form.getValues()
      if (values.full_name === "") {
        values.full_name = undefined
      }

      await mutation.mutateAsync(values)
    } catch {
      // error is handled by mutation
      form.setErrors({ email: 'Correo o usuario incorrecto', username: 'Correo o usuario incorrecto' })
    }
  }

  return (
    <>
      <Button
        variant="filled"
        onClick={open}
      >
        Añadir usuario
      </Button>
      <Modal
        opened={opened}
        onClose={close}
        title="Añadir usuario"
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
            <TextInput
              name='username'
              key={form.key('username')}
              label="Nombre de usuario"
              placeholder="Tu nombre de usuario"
              leftSectionPointerEvents="none"
              leftSection={<TbUser size={15} />}
              {...form.getInputProps('username')}
              required
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
            <Checkbox
              mt="sm"
              defaultChecked
              key={form.key('is_verified')}
              {...form.getInputProps('is_verified')}
              label="Verificado"
            />
            <Checkbox
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
                loaderProps={{type: 'dots'}}
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
