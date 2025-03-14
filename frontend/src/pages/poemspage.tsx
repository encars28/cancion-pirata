import { Shell } from "../components/Shell/Shell";
import { CardGrid } from "../components/Cards/CardGrid";
import { Title } from "@mantine/core";
import { useQuery } from '@tanstack/react-query'
import { handleError, handleSuccess, getQuery } from "../utils";
import { Loading } from "../components/Loading";
import { poemsReadPoems } from "../client/sdk.gen";
import { PoemPublicWithAllTheInfo } from "../client";
import { PoemCard } from "../components/Cards/PoemCard";


export function PoemsPage() {
  const { isPending, isError, isSuccess, data, error } = useQuery({
    ...getQuery('poems', poemsReadPoems),
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

  const poems: PoemPublicWithAllTheInfo[] = data?.data ?? [];
  const authorCount: number = data?.count ?? 0;

  return (
    <Shell>
      <Title mt={40} order={1}>Lista de poemas</Title>
      <Title order={2} c="dimmed" fw="inherit">Total: {authorCount}</Title>
      <CardGrid>
        { 
          poems.map((poem) => {
            return <PoemCard path={`/poems/${poem.id}`} name={poem.title} />
          }) 
        }
      </CardGrid>
    </Shell>
  )
}