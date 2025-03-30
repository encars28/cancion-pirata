import { SimpleGrid, Card, Center } from '@mantine/core';
import React from 'react';
import { useNavigate } from 'react-router';

export interface CardGridProps {
  path: string;
  icon: React.ReactNode;
  description: React.ReactNode;
}

export function CardGrid({ data }: { data: CardGridProps[] }) {
  const navigate = useNavigate()
  return (
    <SimpleGrid
      cols={{ base: 3, xs: 4, sm: 5, md: 6, lg: 8, xl: 9 }}
      spacing="sm"
      verticalSpacing="xl"
      pb={200}
      m={{ base: 50, xs: 60, sm: 70, md: 80, lg: 90 }}
    >
      {data.map((card) => (
        <Card
          padding="xs"
          radius="md"
          onClick={() => navigate(card.path)}
          key={card.path}
        >
          <Card.Section>
            <Center>
              {card.icon}
            </Center>
          </Card.Section>
          {card.description}
        </Card>
      ))}
    </SimpleGrid>)
}