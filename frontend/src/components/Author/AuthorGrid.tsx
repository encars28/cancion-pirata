import { Avatar, Text } from '@mantine/core';
import React from 'react';
import useAuthors, { AuthorQueryParams } from '../../hooks/useAuthors';
import { handleError } from '../../utils';
import { Loading } from '../Loading';
import { AuthorPublicWithPoems } from '../../client';
import { CardGrid } from '../CardGrid';

export interface CardGridProps {
  path: string;
  icon: React.ReactNode;
  description: React.ReactNode;
}

export function AuthorGrid({ filter }: { filter: AuthorQueryParams }) {
  const { data, error, isPending, isError } = useAuthors(filter)

  if (isPending) {
    return (<Loading />)
  }

  if (isError) {
    handleError(error as any);
  }

  const authors = data?.data as AuthorPublicWithPoems[]

  const cardData: CardGridProps[] = authors.map((author) => ({
    path: `/authors/${author.id}`,
    icon: <Avatar name={author.full_name} key={author.full_name} color="initials" size="xl" />,
    description: <Text mt="md" size="sm">{author.full_name}</Text>
  }))

  return (<CardGrid data={cardData} />)
}