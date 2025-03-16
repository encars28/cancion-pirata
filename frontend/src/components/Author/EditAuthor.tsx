import { Stack, TextInput, Group, Button } from '@mantine/core';
import { Form, useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { AuthorUpdate, AuthorPublicWithPoems } from '../../client/types.gen';

export function EditAuthor({ author }: { author: AuthorPublicWithPoems }) {

  const form = useForm<AuthorUpdate>({
    mode: 'uncontrolled',
    // initialValues: {
    //   ...author,
    //   birth_date: date != 'Unknown' ? new Date(date) : undefined,
    // }
  })

  const handleSubmit = () => {}

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Stack gap="lg" ta="left" m="md" pb="md">
        <TextInput
          data-autoFocus
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
          leftSection={<IconCalendar size={18} stroke={1.5} />}
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
            onClick={close}
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
