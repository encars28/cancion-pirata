import { Shell } from "../components/Shell/Shell";
import { AuthorCard } from "../components/Cards/AuthorCard";
import { CardGrid } from "../components/Cards/CardGrid";
import { Title } from "@mantine/core";
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

  return (
    <Shell>
      <Title mt={40} order={1}>Lista de autores</Title>
      <Title order={2} c="dimmed" fw="inherit">Total: {authorCount}</Title>
      <CardGrid>
        { 
          authors.map((author) => {
            return <AuthorCard path={`/authors/${author.id}`} name={author.full_name} />
          }) 
        }
      </CardGrid>
    </Shell>
  )
}