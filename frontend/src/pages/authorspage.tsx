import { Shell } from "../components/Shell/Shell";
import { CardGrid, CardGridProps } from "../components/CardGrid";
import { Avatar, Text, Title } from "@mantine/core";
import { handleError } from "../utils";
import { Loading } from "../components/Loading";
import useAuthors from "../hooks/useAuthors";
import { AuthorPublicWithPoems } from "../client";


export function AuthorsPage() {
  const {data, error, isPending, isError} = useAuthors();

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
      <Title mt={40} order={1}>Lista de autores</Title>
      <Title order={2} c="dimmed" fw="inherit">Total: {authorCount}</Title>
      <CardGrid data={cardData} />
    </Shell>
  )
}