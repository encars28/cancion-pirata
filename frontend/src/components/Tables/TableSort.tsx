import React, { ReactNode, useState } from 'react';
import {
  ScrollArea,
  Table,
  Text,
} from '@mantine/core';
import { Th } from './Th/Th';


interface BasicData {
  id: string
}

export interface TableSortProps<T extends BasicData, H extends {}> {
  data: T[];
  headers: H;
  miw?: number
  fixed?: boolean
}

function sortData(
  data: any[],
  payload: { sortBy: any; reversed: boolean; }
) {
  if (!payload.sortBy) {
    return data;
  }

  const { sortBy } = payload;

  return (
    [...data].sort((a, b) => {
      if (payload.reversed) {
        return b[sortBy].localeCompare(a[sortBy]);
      }
      return a[sortBy].localeCompare(b[sortBy]);
    }
  ));
}

export function TableSort<T extends BasicData, H extends {}>({ data, headers, miw, fixed }: TableSortProps<T, H>) {
  const [sortBy, setSortBy] = useState<keyof T | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const sortedData = sortData(data, { sortBy, reversed: reverseSortDirection });

  const setSorting = (field: keyof T) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
  };

  const rows = sortedData.map((row) => (
    <Table.Tr
      key={row.id}
      ta="left"
    >
      {Object.entries(row).map(([key, value]) => (
        key !== 'id' ? <Table.Td key={key}>{value as string | React.ReactNode}</Table.Td> : null
      ))}
    </Table.Tr>
  ));

  return (
    <ScrollArea 
      w="100%"
    >
      <Table horizontalSpacing="md" verticalSpacing="sm" miw={miw} layout={fixed ? 'fixed': 'auto'}>
        <Table.Tbody>
          <Table.Tr>
            {Object.entries(headers).map(([key, value]) =>
              typeof sortedData[0][key] === 'string' ? (
                <Th
                  key={key}
                  sorted={sortBy === key}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting(key as keyof T)}
                >
                  {value as string}
                </Th>
              ) : <Table.Th p={0} key={key}>{value as ReactNode}</Table.Th>
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