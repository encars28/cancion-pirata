import { Shell } from "../components/UI/Shell/Shell";
import { AuthorCard } from "../components/UI/Cards/AuthorCard";
import { CardGrid } from "../components/UI/Cards/CardGrid";
import { Title } from "@mantine/core";
import { authorsReadAuthors } from "../client/sdk.gen";
import { useQuery } from '@tanstack/react-query'
import { handleError, handleSuccess, getQuery } from "../utils";
import { Loading } from "../components/Loading";
import { AuthorPublicWithPoems } from "../client";


export function AuthorsPage() {
  const { isPending, isError, isSuccess, data, error } = useQuery({
    ...getQuery('authors', authorsReadAuthors),
    placeholderData: (prevData) => prevData,
  })

  if (isPending) {
    return (<Loading />)
  }

  if (isError) {
    handleError(error as any);
  }

  if (isSuccess) {
    handleSuccess();
  }

  const authors: AuthorPublicWithPoems[] = data?.data ?? [];
  const authorCount: number = data?.count ?? 0;

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