import { Pagination, Title, Stack, Text } from "@mantine/core";
import React from "react";
import { Loading } from "../Loading";
import { PoemPublic, SearchParams, PoemsPublic } from "../../client";
import { POEMS_PER_PAGE } from "../../pages/poemspage";
import { ShowPoemGrid } from "./ShowPoemGrid";
import { useSearchParams } from "react-router";
import useSearch from "../../hooks/useSearch";
import { notifications } from "@mantine/notifications";
import { errorNotification } from "../../notifications";

export interface CardGridProps {
  path: string;
  icon: React.ReactNode;
  description: React.ReactNode;
}

export function PoemGrid({
  filter,
  setPage,
}: {
  filter: SearchParams
  setPage: (page: number) => void;
}) {
  const { data, error, isPending, isError } = useSearch(filter);
  const [searchParams] = useSearchParams();

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    notifications.clean()
    notifications.show(errorNotification({title: "Error cargando poemas", description: error.message}));
    return (
      <Title order={3} fw="lighter" ta="center" c="dimmed" mt={100}>
        No se pudieron cargar los poemas.<br/> Por favor, inténtalo de nuevo más tarde.
      </Title>
    )
  }

  const poemsData = (data?.poems as PoemsPublic).data;
  // Since the search model is quite complex hey-api doesn't do the automatic conversion
  // This can be removed when the library is updated to handle this automatically
  const poems: PoemPublic[] = poemsData.map((poem) => ({
    ...poem,
    // @ts-ignore
    created_at: new Date(poem.created_at), 
    // @ts-ignore
    updated_at: new Date(poem.updated_at),
  }))

  const count = (data?.poems as PoemsPublic).count as number;
  const totalPages =
    count % POEMS_PER_PAGE === 0
      ? count / POEMS_PER_PAGE
      : Math.floor(count / POEMS_PER_PAGE) + 1;

  return (
    <Stack
      align="center"
      gap={80}
      m="lg"
    >
      <ShowPoemGrid poems={poems} show_author />
      <Stack>
        <Text c="dimmed" ta="center" size="sm">
          Página {searchParams.get("page") ?? 1} de {totalPages}
        </Text>
        <Pagination
          color="grey"
          // siblings={3}
          withPages={false}
          total={totalPages}
          onChange={(page) => setPage(page)}
          disabled={count <= POEMS_PER_PAGE}
          withEdges
        />
      </Stack>
    </Stack>
  );
}
