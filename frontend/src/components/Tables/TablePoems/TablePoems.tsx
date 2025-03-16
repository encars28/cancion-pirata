import { useState } from 'react';
import { TbSearch } from "react-icons/tb";
import {
  ScrollArea,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { Th } from '../Th/Th';
import { sortData } from '../sort';
import { To, useNavigate } from 'react-router';
import classes from './TablePoems.module.css';

export interface RowData {
  title: string;
  created_at: string;
  language: string;
  link?: To;
}

const headers:RowData = {
  title: 'Título',
  created_at: 'Fecha de creación',
  language: 'Idioma',
}

export function TablePoems({ data }: { data: RowData[] }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<keyof RowData | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const sortedData = sortData(data, { sortBy, reversed: reverseSortDirection, search });

  const setSorting = (field: keyof RowData) => {
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
      key={row.title}
      ta="left"
    >
      {row.link ? (
        <Table.Td onClick={() => navigate(row.link!)} className={classes.link}>{row.title}</Table.Td>
      ) : (
        <Table.Td>{row.title}</Table.Td>
      )}
      <Table.Td>{row.created_at}</Table.Td>
      <Table.Td>{row.language}</Table.Td>
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
            {Object.entries(headers).map(([key, value]) => (
              <Th
                key={key}
                sorted={sortBy === key}
                reversed={reverseSortDirection}
                onSort={() => setSorting(key as keyof RowData)}
              >
                {value}
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