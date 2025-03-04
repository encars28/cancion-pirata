import { useState } from 'react';
import { IconSearch } from '@tabler/icons-react';
import {
  ScrollArea,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { Th } from './Th/Th';
import { sortData } from './sort';

export function TableSort({data}: {data: any[]}) {
  type RowData = typeof data[0]

  const [search, setSearch] = useState('');
  const [sortedData, setSortedData] = useState(data);
  const [sortBy, setSortBy] = useState<keyof RowData | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const setSorting = (field: keyof RowData) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(data, { sortBy: field, reversed, search }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(sortData(data, { sortBy, reversed: reverseSortDirection, search: value }));
  };

  const rows = sortedData.map((row) => (
    <Table.Tr key={Object.values(row)[0] as string}>
      { Object.values(row).map(value => (  
        <Table.Td>{value as string}</Table.Td> 
      ))}
    </Table.Tr>
  ));

  return (
    <ScrollArea m="xl">
      <TextInput
        placeholder="Buscar"
        mb="md"
        leftSection={<IconSearch size={16} stroke={1.5} />}
        value={search}
        onChange={handleSearchChange}
      />

      <Table horizontalSpacing="md" verticalSpacing="xs" miw={700} layout="fixed">
        <Table.Tbody>
          <Table.Tr>
            { Object.keys(data[0]).map(key => (
              <Th 
                sorted={sortBy === key}
                reversed={reverseSortDirection}
                onSort={() => setSorting(key)}
              >
                {key}
              </Th>
              ))
            }
          </Table.Tr>
        </Table.Tbody>
        <Table.Tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td colSpan={Object.keys(data[0]).length}>
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