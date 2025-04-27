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
      cols={{ base: 3, sm: 4, md: 6, lg: 7, xl: 8 }}
      spacing="sm"
      verticalSpacing="xl"
      pb={200}
      mt={60}
      ml={60}
      mr="xl"
      w="100%"
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