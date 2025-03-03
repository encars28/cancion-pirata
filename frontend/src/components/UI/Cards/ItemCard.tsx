import {
  Card,
  BoxProps,
  Center,
} from '@mantine/core'
import React from 'react';

import { useNavigate } from 'react-router';

export interface ItemCardProps extends BoxProps {
  path: string;
  icon: React.ReactNode;
  description: React.ReactNode;
}

export function ItemCard({ path, icon, description}: ItemCardProps) {
  const navigate = useNavigate();
  return (
    <Card
      padding="xs"
      radius="md"
      onClick={() => navigate(path)}
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