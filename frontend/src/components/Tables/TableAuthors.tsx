import { Stack, Group, Pagination, Text, ActionIcon, ScrollArea, Table } from "@mantine/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";
import { Loading } from "../Loading";
import { handleError, callService } from "../../utils";
import { AuthorPublic, AuthorPublicWithPoems, authorsReadAuthors } from "../../client";
import { EditAuthor } from "../Author/EditAuthor";
import { DeleteAuthor } from "../Author/DeleteAuthor";
import { TbEye } from "react-icons/tb";
import { AddAuthor } from "../Author/AddAuthor";
import { Th } from "./Th/Th";
import { useState } from "react";

const PER_PAGE = 6

interface RowData {
  full_name: string;
  birth_date: string;
  poems: string;
}

function getUsersQueryOptions({ page, order_by, desc }: { page: number, order_by?: keyof RowData, desc: boolean }) {
  return {
    queryFn: async () =>
      callService(authorsReadAuthors, { query: { skip: (page - 1) * PER_PAGE, limit: PER_PAGE, order_by: order_by, desc: desc } }),
    queryKey: ["authors", { page }],
  }
}

export function TableAuthors() {
  const [sortBy, setSortBy] = useState<keyof RowData | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1

  const setPage = (page: number) => navigate({ search: `?page=${page}` })

  const setSorting = (field: keyof RowData) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    queryClient.invalidateQueries({ queryKey: ["authors", { page }]})
  };

  const { isPending, isError, data, error } = useQuery({
    ...getUsersQueryOptions({ page: page, order_by: sortBy ?? undefined, desc: reverseSortDirection }),
    placeholderData: (prevData) => prevData,
  })

  if (isPending) {
    return (<Loading />)
  }

  if (isError) {
    handleError(error as any);
  }

  const authors: AuthorPublicWithPoems[] = data?.data.slice(0, PER_PAGE) ?? []
  const count = data?.count ?? 0

  const headers = {
    full_name: 'Nombre',
    birth_date: 'Fecha de nacimiento',
    poems: 'Poemas',
    actions: 'Acciones'
  }

  const rows = authors.map((author) => (
    <Table.Tr
      key={author.id}
      ta="left"
    >
      <Table.Td>{author.full_name}</Table.Td>
      <Table.Td>{author.birth_date?.toLocaleString() ?? '--'}</Table.Td>
      <Table.Td>{author.poems?.length ?? 0}</Table.Td>
      <Table.Td>
        <Group gap="xs" justify="center">
          <ActionIcon variant="outline" onClick={() => navigate(`/authors/${author.id}`)}>
            <TbEye />
          </ActionIcon>
          <EditAuthor author={author as AuthorPublic} icon />
          <DeleteAuthor author_id={author.id} icon />
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack m="xl">
      <Group
        justify="flex-end"
        mb="xl"
        mr={{ base: 0, lg: "lg" }}
      >
        <AddAuthor />
      </Group>
      <Stack
        align="center"
        gap="xl"
        mr={{ base: 0, lg: "lg" }}
        ml={{ base: 0, lg: "lg" }}
      >
        <ScrollArea
          w="100%"
        >
          <Table horizontalSpacing="md" verticalSpacing="sm" miw={600} layout="fixed">

            <Table.Tbody>
              <Table.Tr>
                <Th
                  sorted={sortBy === 'full_name'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('full_name')}
                >
                  Nombre
                </Th>
                <Th
                  sorted={sortBy === 'birth_date'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('birth_date')}
                >
                  Fecha de nacimiento
                </Th>
                <Th
                  sorted={sortBy === 'poems'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('poems')}
                >
                  Poemas
                </Th>
                <Table.Th p={0}>
                  Acciones
                </Table.Th>
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
        <Pagination
          mb="xl"
          mt="md"
          siblings={3}
          total={count % PER_PAGE === 0 ? count / PER_PAGE : Math.floor(count / PER_PAGE) + 1}
          onChange={(page) => setPage(page)}
          disabled={count <= PER_PAGE}
        />
      </Stack>
    </Stack>
  )
}