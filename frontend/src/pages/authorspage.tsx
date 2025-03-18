import { Shell } from "../components/Shell/Shell";
import { AuthorCard } from "../components/Cards/AuthorCard";
import { CardGrid } from "../components/Cards/CardGrid";
import { Title } from "@mantine/core";
import { authorsReadAuthors } from "../client/sdk.gen";
import { useQuery } from '@tanstack/react-query'
import { callService, handleError } from "../utils";
import { Loading } from "../components/Loading";
import { AuthorPublicWithPoems, AuthorsPublic } from "../client";


export function AuthorsPage() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['authors'],
    queryFn: async () => callService(authorsReadAuthors),
    placeholderData: (prevData) => prevData,
  })

  if (isPending) {
    return (<Loading />)
  }

  if (isError) {
    handleError(error as any);
  }

  const authors: AuthorPublicWithPoems[] = (data as unknown as AuthorsPublic)?.data ?? [];
  const authorCount: number = (data as unknown as AuthorsPublic)?.count ?? 0;

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