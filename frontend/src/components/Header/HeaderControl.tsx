import { BoxProps, Tooltip, UnstyledButton, createPolymorphicComponent } from '@mantine/core';

export interface HeaderControlProps extends BoxProps {
  tooltip: string;
  children: React.ReactNode;
}

function _MobileControl(
  { tooltip, ...others }: HeaderControlProps
) {
  return (
    <Tooltip label={tooltip}>
      <UnstyledButton
        aria-label={tooltip}
        {...others}
      />
    </Tooltip>
  );
}

// Tooltip is only allowed to have one child
// We have to do this otherwise it will throw an erro
export const HeaderControl = createPolymorphicComponent<'button', HeaderControlProps>(
  _MobileControl
);