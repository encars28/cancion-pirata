import { Image, Pagination, Stack, Text } from '@mantine/core';
import React from 'react';
import usePoems, { PoemQueryParams } from '../../hooks/usePoems';
import { handleError } from '../../utils';
import { Loading } from '../Loading';
import { PoemPublicBasic } from '../../client';
import { CardGrid } from '../CardGrid';
import { POEMS_PER_PAGE } from '../../pages/poemspage';

export interface CardGridProps {
  path: string;
  icon: React.ReactNode;
  description: React.ReactNode;
}

export function PoemGrid({ filter, setPage }: { filter: PoemQueryParams, setPage: (page: number) => void }) {
  const { data, error, isPending, isError } = usePoems(filter)

  if (isPending) {
    return (<Loading />)
  }

  if (isError) {
    handleError(error as any);
  }

  const poems = data?.data as PoemPublicBasic[]
  const count = data?.count as number

  const cardData: CardGridProps[] = poems.map((poem) => ({
    path: `/poems/${poem.id}`,
    icon: <Image src="/src/assets/scroll.png" fit="contain" w={100} />,
    description: <Text mt="md" size="sm">{poem.title}</Text>
  }))

  return (
  <Stack 
    align='center'
    gap={100}
    mt={60}
    mb={60}
    mr="xl"
    ml={{base: "xl", md: 60}}
    w="100%"
  >
    <CardGrid data={cardData} />
    <Pagination
      color='grey'
      siblings={3}
      total={count % POEMS_PER_PAGE === 0 ? count / POEMS_PER_PAGE : Math.floor(count / POEMS_PER_PAGE) + 1}
      onChange={(page) => setPage(page)}
      disabled={count <= POEMS_PER_PAGE}
    />
  </Stack>

  )
}