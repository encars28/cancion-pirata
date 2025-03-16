import { Modal, Stack, TextInput, Group, Button, Space } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';

export function UpdateAuthor({ opened, open, close }: { opened: boolean, open: () => void, close: () => void }) {
  return (
    <Modal opened={opened} onClose={close} title="Modificar datos" centered>
      <Stack gap="lg" ta="left" m="md" pb="md">
        <TextInput
          name='full_name'
          // key={form.key('email')}
          label="Nombre completo"
          placeholder="Juan Ramón Jiménez"
          // {...form.getInputProps('email')}
          required
        />
        <DateInput
          clearable
          defaultValue={new Date()}
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
    </Modal>
  )
}