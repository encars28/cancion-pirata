import { ActionIcon, Menu, Text } from "@mantine/core";
import { TbHelp } from "react-icons/tb";

export function FilterInfoButton() {
  return (
    <Menu shadow="md" trigger="hover" position="bottom-end" width={250}>
      <Menu.Target>
        <ActionIcon variant="transparent" color="grey">
          <TbHelp size={16}/>
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown px="md" py="sm">
        <Text size="sm" c="light">
          Puedes añadir símbolos de comparación delante de los números para filtrar los resultados.
          Por ejemplo: "{">"}10", "{"<="}6"
        </Text>
      </Menu.Dropdown>
    </Menu>
  )
}
