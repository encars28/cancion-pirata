import { BoxProps, Tooltip, UnstyledButton } from '@mantine/core';
import classes from './MobileControl.module.css';

export interface ControlProps extends BoxProps {
  tooltip: string;
  children: React.ReactNode;
}

export default function HeaderControl(
  { tooltip, children }: ControlProps
) {
  return (
    <Tooltip label={tooltip}>
      <UnstyledButton
        className={classes.control}
        aria-label={tooltip}
      />
      {children}
    </Tooltip>
  );
}