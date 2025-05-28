import { Stack, TextInput, Modal, Group, Button, ActionIcon } from '@mantine/core';
import { Form, useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { TbCalendar, TbPencil } from "react-icons/tb";
import { AuthorUpdate, AuthorPublic } from '../../client/types.gen';
import { useDisclosure } from '@mantine/hooks';
import useAuthorActions from '../../hooks/useAuthorActions';

export function EditAuthor({ author, icon }: { author: AuthorPublic, icon?: boolean }) {
  const [opened, { open, close }] = useDisclosure()
  const { editAuthorMutation: mutation } = useAuthorActions(author.id)


  const form = useForm<AuthorUpdate>({
    mode: 'uncontrolled',
    initialValues: {
      ...author,
      full_name: '',
    },
    enhanceGetInputProps: () => ({
      disabled: mutation.isPending,
    }),
  })


  const handleSubmit = async () => {
    try {
      if (form.isDirty()) 
      {
        const values = form.getValues()
        if (values.full_name === "") {
          values.full_name = undefined
        }
        await mutation.mutateAsync(values)
        form.resetDirty()
      }
    } catch {
      // error is handled by mutation
      form.setErrors({ full_name: 'Nombre repetido o incorrecto' })
    }
  }   

  return (
    <>
      {icon ? (
        <ActionIcon variant='filled' onClick={open}>
          <TbPencil />
        </ActionIcon>
      ) : (
        <Button
          variant="outline"
          onClick={open}
        >
          Modificar datos
        </Button>
      )}
      <Modal
        opened={opened}
        onClose={close}
        title="Modificar datos"
        overlayProps={{
          blur: 3,
        }}
        closeOnClickOutside={false}
        centered>
        <Form form={form} onSubmit={handleSubmit}>
          <Stack gap="lg" ta="left" m="md" pb="md">
            <TextInput
              name='full_name'
              label="Nombre completo"
              placeholder={author.full_name}
              {...form.getInputProps('full_name')}
              key={form.key('full_name')}
            />
            <DateInput
              clearable
              name='birth_date'
              leftSection={<TbCalendar size={18} />}
              leftSectionPointerEvents="none"
              label="Fecha de nacimiento"
              placeholder="Fecha de nacimiento"
              valueFormat="DD/MM/YYYY"
              {...form.getInputProps('birth_date')}
              key={form.key('birth_date')}
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
