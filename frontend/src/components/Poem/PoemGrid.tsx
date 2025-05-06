import { Image, Text } from '@mantine/core';
import React from 'react';
import usePoems, { PoemQueryParams } from '../../hooks/usePoems';
import { handleError } from '../../utils';
import { Loading } from '../Loading';
import { PoemPublicBasic } from '../../client';
import { CardGrid } from '../CardGrid';

export interface CardGridProps {
  path: string;
  icon: React.ReactNode;
  description: React.ReactNode;
}

export function PoemGrid({ filter }: { filter: PoemQueryParams }) {
  const { data, error, isPending, isError } = usePoems(filter)

  if (isPending) {
    return (<Loading />)
  }

  if (isError) {
    handleError(error as any);
  }

  const poems = data?.data as PoemPublicBasic[]

  const cardData: CardGridProps[] = poems.map((poem) => ({
    path: `/poems/${poem.id}`,
    icon: <Image src="/src/assets/scroll.png" fit="contain" w={100} />,
    description: <Text mt="md" size="sm">{poem.title}</Text>
  }))

  return (<CardGrid data={cardData} />)
}