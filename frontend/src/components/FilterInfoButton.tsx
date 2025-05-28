import { ActionIcon, HoverCard, Text } from "@mantine/core";
import { TbHelp } from "react-icons/tb";

export function FilterInfoButton() {
  return (
    <HoverCard shadow="md" position="bottom-end" width={250}>
      <HoverCard.Target>
        <ActionIcon variant="transparent" color="grey">
          <TbHelp size={16} />
        </ActionIcon>
      </HoverCard.Target>
      <HoverCard.Dropdown px="md" py="sm">
        <Text size="sm" c="light">
          Puedes añadir símbolos de comparación delante de los números para
          filtrar los resultados. Por ejemplo: "{">"}10", "{"<="}6"
        </Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
