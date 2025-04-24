import { Stack, Group, Pagination, ActionIcon } from "@mantine/core";
import { TableSort } from "../Tables/TableSort";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";
import { Loading } from "../Loading";
import { handleError, callService } from "../../utils";
import { PoemPublicWithAuthor, poemsReadPoems } from "../../client";
import { DeletePoem } from "../Poem/DeletePoem";
import { TbEye } from "react-icons/tb";

const PER_PAGE = 8

function getUsersQueryOptions({ page }: { page: number }) {
  return {
    queryFn: async () =>
      callService(poemsReadPoems, { query: { skip: (page - 1) * PER_PAGE, limit: PER_PAGE } }),
    queryKey: ["poems", { page }],
  }
}

export function TablePoems() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1

  const setPage = (page: number) => navigate({ search: `?page=${page}` })

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

  const poems: PoemPublicWithAuthor[] = data?.data.slice(0, PER_PAGE) ?? []
  const count = data?.count ?? 0

  const poemHeaders = {
    title: 'Título',
    is_public: 'Público',
    show_author: 'Mostrar autor',
    original: 'Original',
    created_at: 'Creación',
    actions: 'Acciones'
  }

  const poemData = poems.map((poem) => ({
    id: poem.id,
    title: poem.title,
    is_public: poem.is_public ? 'Sí' : 'No',
    show_author: poem.show_author ? 'Sí' : 'No',
    original: poem.type ? 'Derivado' : 'Original',
    created_at: poem.created_at?.toLocaleDateString() ?? '',
    actions: <Group gap="xs">
        <ActionIcon variant="outline" onClick={() => navigate(`/poems/${poem.id}`)}>
          <TbEye />
        </ActionIcon>
        <DeletePoem poem_id={poem.id} icon/>
      </Group>
  }))

  return (
    <Stack
      align="center"
      gap="xl"
      m="xl"
      mr={{ base: 0, lg: "lg" }}
      ml={{ base: 0, lg: "lg" }}
    >
      <TableSort
        headers={poemHeaders}
        data={poemData}
        miw={960}
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