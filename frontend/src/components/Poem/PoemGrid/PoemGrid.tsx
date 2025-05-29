import {

  Pagination,

  Stack,

} from "@mantine/core";
import React from "react";
import usePoems, { PoemQueryParams } from "../../../hooks/usePoems";
import { handleError } from "../../../utils";
import { Loading } from "../../Loading";
import { PoemPublicWithAuthor } from "../../../client";
import { POEMS_PER_PAGE } from "../../../pages/poemspage";
import { ShowPoemGrid } from "./ShowPoemGrid";

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

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    handleError(error as any);
  }

  const poems = data?.data as PoemPublicWithAuthor[];
  const count = data?.count as number;

  return (
    <Stack
      align="center"
      gap={100}
      mt="xl"
      mb={60}
      mr="xl"
      ml={{ base: "xl", md: 60 }}
      w="100%"
    >
      <ShowPoemGrid poems={poems} show_author/>
      <Pagination
        color="grey"
        siblings={3}
        total={
          count % POEMS_PER_PAGE === 0
            ? count / POEMS_PER_PAGE
            : Math.floor(count / POEMS_PER_PAGE) + 1
        }
        onChange={(page) => setPage(page)}
        disabled={count <= POEMS_PER_PAGE}
      />
    </Stack>
  );
}
