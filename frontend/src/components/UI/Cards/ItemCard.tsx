import {
  Card,
  BoxProps,
  Center,
} from '@mantine/core'
import React from 'react';

export interface ItemCardProps extends BoxProps {
  path: string;
  icon: React.ReactNode;
  description: React.ReactNode;
}

export function ItemCard({ path, icon, description}: ItemCardProps) {
  return (
    <Card
      padding="xs"
      radius="md"
      component='a'
      href={path}
    >
      <Card.Section>
        <Center>
          {icon}
        </Center>
      </Card.Section>
      {description}
    </Card>
  )
}