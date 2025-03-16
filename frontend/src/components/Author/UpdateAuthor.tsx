import { Modal } from '@mantine/core';

export function UpdateAuthor({ opened, open, close }: { opened: boolean, open: () => void, close: () => void }) {
  return (
    <Modal opened={opened} onClose={close} title="Modificar datos" centered>
    {/* Modal content */}
    </Modal>
  )
}