import cx from "clsx";
import {
  ActionIcon,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import classes from "./ColorToggle.module.css";
import { TbMoon, TbSun } from "react-icons/tb";

export function ColorToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  return (
    <ActionIcon
      onClick={() =>
        setColorScheme(computedColorScheme === "light" ? "dark" : "light")
      }
      variant="default"
      size={35}
      radius="md"
      aria-label="Toggle color scheme"
    >
      <TbSun className={cx(classes.icon, classes.light)} />
      <TbMoon className={cx(classes.icon, classes.dark)} />
    </ActionIcon>
  );
}
