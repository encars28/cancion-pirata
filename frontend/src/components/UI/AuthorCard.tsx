import {
  Card,
  Image,
  Text,
} from '@mantine/core'

export function AuthorCard({ path, name }: { path: string, name: string }) {
  return (
    <Card padding="sm" radius="md" component='a' href={path}>
      <Card.Section>
        <Image
          src="src/assets/skull.png"
          alt="Author"
          fit="contain"
          h={100}
        />
      </Card.Section>

      <Text mt="md" size="sm">
        {name}
      </Text>
    </Card>
  )
}