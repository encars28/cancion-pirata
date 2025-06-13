import { Avatar, Pagination, Stack, Text } from "@mantine/core";
import React from "react";
import { Loading } from "../Loading";
import { AuthorPublic, AuthorsPublic, SearchParams } from "../../client";
import { CardGrid } from "../CardGrid";
import { AUTHORS_PER_PAGE } from "../../pages/authorspage";
import { useSearchParams } from "react-router";
import useSearch from "../../hooks/useSearch";
import { notifications } from "@mantine/notifications";
import { errorNotification } from "../Notifications/notifications";

export interface CardGridProps {
  path: string;
  icon: React.ReactNode;
  description: React.ReactNode;
}

export function AuthorGrid({
  filter,
  setPage,
}: {
  filter: SearchParams;
  setPage: (page: number) => void;
}) {
  const { data, error, isPending, isError } = useSearch(filter)
  const [searchParams] = useSearchParams();

  if (isPending) {
    return (<Loading />)
  }

  if (isError) {
    notifications.show(errorNotification({
      title: "Error al cargar los autores",
      description: error.message || "Ha ocurrido un error al cargar los autores.",
    }));
  }

  const authors = (data?.authors as AuthorsPublic).data as AuthorPublic[];
  // Here it is not necessary to do the date conversion since the data is not being displayed
  const count = (data?.authors as AuthorsPublic).count as number;
  const totalPages =
    count % AUTHORS_PER_PAGE === 0
      ? count / AUTHORS_PER_PAGE
      : Math.floor(count / AUTHORS_PER_PAGE) + 1;

  const cardData: CardGridProps[] = authors.map((author) => ({
    path: `/authors/${author.id}`,
    icon: (
      <Avatar
        name={author.full_name}
        key={author.full_name}
        color="initials"
        size="xl"
      />
    ),
    description: (
      <Text mt="md" size="sm">
        {author.full_name}
      </Text>
    ),
  }));

  return (
    <Stack align="center" gap={80} m="xl" pb={70}>
      <CardGrid data={cardData} />
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
          disabled={count <= AUTHORS_PER_PAGE}
          withEdges
        />
      </Stack>
    </Stack>
  );
}
