import { IconUser } from '@tabler/icons-react';
import { HeaderControl } from '../HeaderControl';
import classes from './LoginControl.module.css';
import { rem } from '@mantine/core';
import { useNavigate } from 'react-router';

export function LoginControl() {
  const navigate = useNavigate();
  return (
    <HeaderControl
      tooltip="Login"
      className={classes.control}
      onClick={() => navigate("/login")}
    >
      <IconUser size={rem(22)} stroke={1.5} />
    </HeaderControl>
  );
}