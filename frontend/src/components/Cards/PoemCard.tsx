import { Image, Text } from '@mantine/core';
import { ItemCard } from './ItemCard';

export function PoemCard({ path, name }: { path: string, name: string }) {
  return (
    <ItemCard
      path={path}
      // icon={<Avatar name={name} key={name} color="initials" size="xl" />}
      icon={<Image src="src/assets/scroll.png" alt="Poem" fit="contain" w={100}/>}
      description={<Text mt="md" size="sm">{name}</Text>}
    />
  )
}