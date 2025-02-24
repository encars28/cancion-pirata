import {
  ActionIcon,
  Group,
  Text,
  rem,
  UnstyledButton,
} from '@mantine/core';

import { IconSearch } from '@tabler/icons-react';
import { searchHandlers } from './Search';
import classes from './SearchControl.module.css';

export function SearchMobileControl({ onSearch = searchHandlers.open }) {
  return (
    <ActionIcon 
      onClick={() => onSearch()} 
      variant='default'
      size={rem(40)}
    >
      <IconSearch stroke={1.5} />
    </ActionIcon>
  );
}

export function SearchControl({ onSearch = searchHandlers.open }) {
  return (
    <UnstyledButton 
      onClick={() => onSearch()} 
      className={classes.root}
    >
      <Group gap="xs">
        <IconSearch style={{ width: rem(15), height: rem(15) }} stroke={1.5} />
        <Text fz="sm" c="dimmed" pr={150}>
          Buscar
        </Text>
      </Group>
    </UnstyledButton>
  );
}