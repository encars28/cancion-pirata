import { SimpleGrid, Card, Center } from '@mantine/core';
import React from 'react';
import { useNavigate } from 'react-router';

export interface AuthorGridProps {
  path: string;
  icon: React.ReactNode;
  description: React.ReactNode;
}

export function AuthorGrid({ data }: { data: AuthorGridProps[] }) {
  const navigate = useNavigate()
  return (
    <SimpleGrid
      cols={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
      spacing="sm"
      verticalSpacing="xl" 
      w="100%"
      px={{base: "xl", lg: 60}}
    >
      {data.map((card) => (
        <Card
          padding="xs"
          radius="md"
          style={{backgroundColor: "transparent", cursor: "pointer"}}
          onClick={() => navigate(card.path)}
          key={card.path}
          ta="center"
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