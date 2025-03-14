import { Avatar, Text } from '@mantine/core';
import { ItemCard } from './ItemCard';

export function AuthorCard({ path, name }: { path: string, name: string }) {
  return (
    <ItemCard
      path={path}
      icon={<Avatar name={name} key={name} color="initials" size="xl" />}
      description={<Text mt="md" size="sm">{name}</Text>}
    />
  )
}