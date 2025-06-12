import { Stack, Anchor, Button, HoverCard, Text } from "@mantine/core";
import { useNavigate } from "react-router";

export function PoemHelp() {
  const navigate = useNavigate();
  return (
    <HoverCard shadow="md" position="bottom-start" width={300} withArrow>
      <HoverCard.Target>
        <Anchor underline="hover" c="grey" size="sm" >
          ¿Necesitas ayuda para formatear el poema?
        </Anchor>
      </HoverCard.Target>
      <HoverCard.Dropdown p="md">
        <Stack gap="lg">
          {" "}
          <Text size="sm" c="light">
            Para descubrir más acerca del formato de los poemas visita nuestra
            página de ayuda
          </Text>
          <Button fullWidth onClick={() => navigate("/help")}>
            Ayuda
          </Button>
        </Stack>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
