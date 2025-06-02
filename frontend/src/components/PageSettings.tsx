import { Divider, Switch, Stack, Title, Group } from "@mantine/core";
import { TbMoonStars, TbSun } from "react-icons/tb";
import { useState } from 'react';
import { useMantineColorScheme } from "@mantine/core";

export function PageSettings() {
  const [checked, setChecked] = useState(false);
  const { setColorScheme } = useMantineColorScheme();

  const handleSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.currentTarget.checked);
    const theme = event.currentTarget.checked ? 'dark' : 'light';
    setColorScheme(theme);
  }

  return (
    <Stack  mx="xl">
      <Group justify="space-between">
        <Title mt="xl" fw="normal" ml="xl" order={2}>Ajustes</Title>
        <Switch
          mt="xl"
          mr="xl"
          size="lg"
          color="dark.4"
          checked={checked}
          onChange={(event) => handleSwitch(event)}
          offLabel={<TbSun size={22} color="var(--mantine-color-orange-6)" />}
          onLabel={<TbMoonStars size={22} color="var(--mantine-color-blue-6)" />}
        />
      </Group>
      <Divider />
    </Stack>
  );
}