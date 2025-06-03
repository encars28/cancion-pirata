import { Avatar, Pagination, Stack, Text } from '@mantine/core';
import React from 'react';
import useAuthors, { AuthorQueryParams } from '../../hooks/useAuthors';
import { handleError } from '../../utils';
import { Loading } from '../Loading';
import { AuthorPublicWithPoems } from '../../client';
import { CardGrid } from '../CardGrid';
import { AUTHORS_PER_PAGE } from '../../pages/authorspage';
import { useSearchParams } from 'react-router';

export interface CardGridProps {
  path: string;
  icon: React.ReactNode;
  description: React.ReactNode;
}

export function AuthorGrid({ filter, setPage }: { filter: AuthorQueryParams, setPage: (page: number) => void  }) {
  const { data, error, isPending, isError } = useAuthors(filter)
  const [searchParams] = useSearchParams();

  if (isPending) {
    return (<Loading />)
  }

  if (isError) {
    handleError(error as any);
  }

  const authors = data?.data as AuthorPublicWithPoems[]
  const count = data?.count as number
  const totalPages =
    count % AUTHORS_PER_PAGE === 0
      ? count / AUTHORS_PER_PAGE
      : Math.floor(count / AUTHORS_PER_PAGE) + 1;

  const cardData: CardGridProps[] = authors.map((author) => ({
    path: `/authors/${author.id}`,
    icon: <Avatar name={author.full_name} key={author.full_name} color="initials" size="xl" />,
    description: <Text mt="md" size="sm">{author.full_name}</Text>
  }))

  return (
    <Stack
    align="center"
    gap={80}
    m="xl"
    pb={70}
    >
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
  )
}