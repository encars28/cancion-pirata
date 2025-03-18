import { Shell } from "../components/Shell/Shell";
import { CardGrid } from "../components/Cards/CardGrid";
import { Title } from "@mantine/core";
import { useQuery } from '@tanstack/react-query'
import { callService, handleError } from "../utils";
import { Loading } from "../components/Loading";
import { poemsReadPoems } from "../client/sdk.gen";
import { PoemPublicWithAllTheInfo, PoemsPublic } from "../client";
import { PoemCard } from "../components/Cards/PoemCard";


export function PoemsPage() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['poems'],
    queryFn: async () => callService(poemsReadPoems),
    placeholderData: (prevData) => prevData,
  })

  if (isPending) {
    return (<Loading />)
  }

  if (isError) {
    handleError(error as any);
  }

  const poems: PoemPublicWithAllTheInfo[] = (data as unknown as PoemsPublic)?.data ?? [];
  const authorCount: number = (data as unknown as PoemsPublic)?.count ?? 0;

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