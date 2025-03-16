import { Stack, TextInput, Group, Button } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';

export function UpdateAuthorForm({name, date}: {name: string, date?: string | null}) {
  return (
    <Stack gap="lg" ta="left" m="md" pb="md">
      <TextInput
        data-autoFocus
        name='full_name'
        // key={form.key('email')}
        label="Nombre completo"
        placeholder={name}
      // {...form.getInputProps('email')}
      />
      <DateInput
        clearable
        defaultValue={date ? new Date(date) : null}
        leftSection={<IconCalendar size={18} stroke={1.5} />}
        leftSectionPointerEvents="none"
        label="Fecha de nacimiento"
        placeholder="Fecha de nacimiento"
        valueFormat="DD/MM/YYYY"
      />
      <Group
        justify='flex-end'
        pt="lg"
      >
        <Button
          onClick={close}
          variant='filled'
          type='submit'
        >
          Guardar
        </Button>
      </Group>
    </Stack>
  )
}
