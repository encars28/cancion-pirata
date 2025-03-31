import { Stack, TextInput, Modal, Group, Button } from '@mantine/core';
import { Form, isNotEmpty, useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { TbCalendar } from "react-icons/tb";
import { AuthorCreate, HttpValidationError } from '../../client/types.gen';
import { callService, handleError, handleSuccess } from '../../utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authorsCreateAuthor } from '../../client';
import { useDisclosure } from '@mantine/hooks';

export function AddAuthor() {
  const [opened, { open, close }] = useDisclosure()

  const form = useForm<AuthorCreate>({
    mode: 'uncontrolled',
    initialValues: {
      full_name: '',
      birth_date: null,
    },
    validate: {
      full_name: isNotEmpty('El nombre es requerido'),
    }
  })

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (data: AuthorCreate) =>
      callService(authorsCreateAuthor, { body: data }),
    onSuccess: () => {
      handleSuccess()
      close()
    },

    onError: (error: HttpValidationError) => {
      handleError(error)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] })
    },
  })

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await mutation.mutateAsync(values)
    } catch {
      // error is handled by mutation
      form.setErrors({ full_name: 'Nombre repetido o incorrecto' })
    }
  }

  return (
    <>
      <Button
        variant="filled"
        onClick={open}
      >
        Añadir autor
      </Button>
      <Modal
        opened={opened}
        onClose={close}
        title="Añadir autor"
        overlayProps={{
          blur: 3,
        }}
        closeOnClickOutside={false}
        centered>
        <Form form={form} onSubmit={handleSubmit}>
          <Stack gap="lg" ta="left" m="md" pb="md">
            <TextInput
              disabled={mutation.isPending}
              name='full_name'
              key={form.key('full_name')}
              label="Nombre completo"
              placeholder="Nombre completo"
              {...form.getInputProps('full_name')}
              required
            />
            <DateInput
              clearable
              disabled={mutation.isPending}
              name='birth_date'
              key={form.key('birth_date')}
              leftSection={<TbCalendar size={18} />}
              leftSectionPointerEvents="none"
              label="Fecha de nacimiento"
              placeholder="Fecha de nacimiento"
              valueFormat="DD/MM/YYYY"
              {...form.getInputProps('birth_date')}
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
