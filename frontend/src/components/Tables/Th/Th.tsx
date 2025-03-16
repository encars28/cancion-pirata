import classes from './Th.module.css';
import { TbChevronDown, TbChevronUp, TbSelector } from "react-icons/tb";
import { Center, Group, Table, Text, UnstyledButton } from '@mantine/core';

interface ThProps {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  onSort: () => void;
}

export function Th({ children, reversed, sorted, onSort }: ThProps) {
  const Icon = sorted ? (reversed ? TbChevronUp : TbChevronDown) : TbSelector;
  return (
    <Table.Th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group justify="space-between">
          <Text fw="bold" fz="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon size={16}/>
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}