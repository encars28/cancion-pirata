import { IconSearch } from '@tabler/icons-react';
import { HeaderControl } from '../../HeaderControl';
import { searchHandlers } from '../Search';
import classes from './SearchControlMobile.module.css';
import { rem } from '@mantine/core';

export function SearchControlMobile() {
  return (
    <HeaderControl
      tooltip="Buscar"
      className={classes.control}
      onClick={searchHandlers.open}
    >
      <IconSearch size={rem(22)} stroke={1.5} />
    </HeaderControl>
  );
}