import React, { useState } from 'react';
import { TbSearch } from "react-icons/tb";
import {
  ScrollArea,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { Th } from './Th/Th';
import { sortData } from './sort';

interface BasicData {
  id: string
}

export interface TableSortProps<T extends BasicData, H extends {}> {
  data: T[];
  headers: H;
}

export function TableSort<T extends BasicData, H extends {}>({ data, headers }: TableSortProps<T, H>) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<keyof T | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const sortedData = sortData(data, { sortBy, reversed: reverseSortDirection, search });

  const setSorting = (field: keyof T) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
  };

  const rows = sortedData.map((row) => (
    <Table.Tr
      key={row.id}
      ta="left"
    >
      {Object.entries(row).map(([key, value]) => (
        key !== 'id' ? <Table.Td>{value as string | React.ReactNode}</Table.Td> : null
      ))}
    </Table.Tr>
  ));

  return (
    <ScrollArea>
      <TextInput
        placeholder="Buscar"
        mb="md"
        leftSection={<TbSearch size={16} />}
        value={search}
        onChange={handleSearchChange}
      />

      <Table horizontalSpacing="md" verticalSpacing="xs" miw={700} layout="fixed">
        <Table.Tbody>
          <Table.Tr>
            {Object.entries(headers).map(([key, value]) =>
              key !== 'actions' ? (
                <Th
                  key={key}
                  sorted={sortBy === key}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting(key as keyof T)}
                >
                  {value as string}
                </Th>
              ) : <Table.Th p={0}>{value as string}</Table.Th>
            )
            }
          </Table.Tr>
        </Table.Tbody>

        <Table.Tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td colSpan={Object.keys(headers).length}>
                <Text fw={500} ta="center">
                  No hay nada aquí...
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}