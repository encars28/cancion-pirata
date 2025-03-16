import {
  Group,
  Text,
  rem,
  UnstyledButton,
} from '@mantine/core';

import { TbSearch } from "react-icons/tb";
import { searchHandlers } from '../Search';
import classes from './SearchControl.module.css';

export function SearchControl() {
  return (
    <UnstyledButton 
      onClick={searchHandlers.open}
      className={classes.root}
    >
      <Group gap="xs">
        <TbSearch style={{ width: rem(15), height: rem(15) }} />
        <Text fz="sm" c="dimmed" pr={200}>
          Buscar
        </Text>
      </Group>
    </UnstyledButton>
  );
}