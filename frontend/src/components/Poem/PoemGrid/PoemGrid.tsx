import { Pagination, Stack, Text } from "@mantine/core";
import React from "react";
import usePoems, { PoemQueryParams } from "../../../hooks/usePoems";
import { showError } from "../../../utils";
import { Loading } from "../../Loading";
import { PoemPublicWithAuthor } from "../../../client";
import { POEMS_PER_PAGE } from "../../../pages/poemspage";
import { ShowPoemGrid } from "./ShowPoemGrid";
import { useSearchParams } from "react-router";

export interface CardGridProps {
  path: string;
  icon: React.ReactNode;
  description: React.ReactNode;
}

export function PoemGrid({
  filter,
  setPage,
}: {
  filter: PoemQueryParams;
  setPage: (page: number) => void;
}) {
  const { data, error, isPending, isError } = usePoems(filter);
  const [searchParams] = useSearchParams();

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    showError(error as any);
  }

  const poems = data?.data as PoemPublicWithAuthor[];
  const count = data?.count as number;
  const totalPages =
    count % POEMS_PER_PAGE === 0
      ? count / POEMS_PER_PAGE
      : Math.floor(count / POEMS_PER_PAGE) + 1;

  return (
    <Stack
      align="center"
      gap={80}
      m="lg"
      pb={70}
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
