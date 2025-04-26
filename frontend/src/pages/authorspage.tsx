import { Shell } from "../components/Shell/Shell";
import { CardGrid, CardGridProps } from "../components/CardGrid";
import { Autocomplete, Container, Stack, Avatar, Text, Title, ActionIcon } from "@mantine/core";
import { handleError } from "../utils";
import { Loading } from "../components/Loading";
import useAuthors from "../hooks/useAuthors";
import { AuthorPublicWithPoems } from "../client";
import { TbFilter, TbSearch } from "react-icons/tb";


export function AuthorsPage() {
  const { data, error, isPending, isError } = useAuthors();

  if (isPending) {
    return (<Loading />)
  }

  if (isError) {
    handleError(error as any);
  }

  const authors: AuthorPublicWithPoems[] = data?.data ?? []
  const authorCount: number = data?.count ?? 0

  const cardData: CardGridProps[] = authors.map((author) => ({
    path: `/authors/${author.id}`,
    icon: <Avatar name={author.full_name} key={author.full_name} color="initials" size="xl" />,
    description: <Text mt="md" size="sm">{author.full_name}</Text>
  }))

  return (
    <Shell>
      <Container mt={40}>
        <Title order={1}>Lista de autores</Title>
        <Title order={2} c="dimmed" fw="inherit">Total: {authorCount}</Title>
      </Container>
      <CardGrid data={cardData} />
    </Shell>
  )
}