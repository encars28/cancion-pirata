import { IconUser } from '@tabler/icons-react';
import { HeaderControl } from '../HeaderControl';
import classes from './LoginControl.module.css';
import { rem } from '@mantine/core';

export function LoginControl() {
  return (
    <HeaderControl
      tooltip="Login"
      className={classes.control}
      component='a'
      href='/'
    >
      <IconUser size={rem(22)} stroke={1.5} />
    </HeaderControl>
  );
}