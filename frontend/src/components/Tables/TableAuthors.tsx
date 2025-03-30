import { Stack, Group, Pagination, ActionIcon } from "@mantine/core";
import { TableSort } from "../Tables/TableSort";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";
import { Loading } from "../Loading";
import { handleError, callService } from "../../utils";
import { AuthorPublicWithPoems, authorsReadAuthors } from "../../client";
import { EditAuthor } from "../Author/EditAuthor";
import { DeleteAuthor } from "../Author/DeleteAuthor";
import { TbEye } from "react-icons/tb";

const PER_PAGE = 6

function getUsersQueryOptions({ page }: { page: number }) {
  return {
    queryFn: async () =>
      callService(authorsReadAuthors, { query: { skip: (page - 1) * PER_PAGE, limit: PER_PAGE } }),
    queryKey: ["authors", { page }],
  }
}

export function TableAuthors() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const table = searchParams.get('table') ? searchParams.get('table') : 'autores'
  const page = searchParams.get('page') && table === 'autores' ? parseInt(searchParams.get('page') as string) : 1

  const setPage = (page: number) => navigate({ search: `?table=autores&page=${page}` })

  const { isPending, isError, data, error } = useQuery({
    ...getUsersQueryOptions({ page }),
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

  const authorsHeaders = {
    full_name: 'Nombre',
    birth_date: 'Fecha de nacimiento',
    actions: 'Acciones'
  }

  const authorData = authors.map((author) => {
    return {
      id: author.id,
      full_name: author.full_name,
      birth_date: author.birth_date?.toLocaleDateString() ?? '',
      actions: <Group gap="xs" justify="center">
          <ActionIcon variant="outline" onClick={() => navigate(`/authors/${author.id}`)}>
            <TbEye />
          </ActionIcon>
          <EditAuthor author={author} icon/>
          <DeleteAuthor author_id={author.id} icon/>
        </Group>
    }
  })

  return (
    <Stack
      align="center"
      gap="xl"
      mr={{ base: 0, lg: "lg" }}
      ml={{ base: 0, lg: "lg" }}
    >
      <TableSort
        headers={authorsHeaders}
        data={authorData}
        miw={500}
        fixed
      />
      <Pagination
        mb="xl"
        mt="md"
        siblings={3}
        total={count % PER_PAGE === 0 ? count / PER_PAGE : Math.floor(count / PER_PAGE) + 1}
        onChange={(page) => setPage(page)}
        disabled={count <= PER_PAGE}
      />
    </Stack>
  )
}