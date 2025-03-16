import { Stack, TextInput, Group, Button } from '@mantine/core';
import { Form, useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { TbCalendar } from "react-icons/tb";
import { AuthorUpdate, AuthorPublicWithPoems, HttpValidationError } from '../../client/types.gen';
import { handleError, handleSuccess } from '../../utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authorsUpdateAuthor } from '../../client';

export function EditAuthor({ author, close }: { author: AuthorPublicWithPoems, close: () => void }) {

  const form = useForm<AuthorUpdate>({
    mode: 'uncontrolled',
    initialValues: {
      ...author,
      full_name: '',
    }
  })

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (data: AuthorUpdate) => {
      const result = await authorsUpdateAuthor({ path: {author_id: author.id}, body: data })
      if (result.error) {
        throw result.error
      }
      return result.data
    },
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

  const handleSubmit = async () => {
    try {
      const values = form.getValues()
      if (values.full_name === "") {
        values.full_name = undefined
      }

      await mutation.mutateAsync(values)
    } catch {
      // error is handled by mutation
      form.setErrors({ full_name: 'Nombre repetido o incorrecto' })
    }
  }

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Stack gap="lg" ta="left" m="md" pb="md">
        <TextInput
          name='full_name'
          key={form.key('full_name')}
          label="Nombre completo"
          placeholder={author.full_name}
          {...form.getInputProps('full_name')}
        />
        <DateInput
          clearable
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
          >
            Guardar
          </Button>
        </Group>
      </Stack>
    </Form>
  )
}
