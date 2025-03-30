import { Shell } from "../components/Shell/Shell";
import { CardGrid } from "../components/Cards/CardGrid";
import { Title } from "@mantine/core";
import { handleError } from "../utils";
import { Loading } from "../components/Loading";
import { PoemPublicWithAllTheInfo } from "../client";
import { PoemCard } from "../components/Cards/PoemCard";
import usePoems from "../hooks/usePoems";


export function PoemsPage() {
  const { isPending, isError, data, error } = usePoems()

  if (isPending) {
    return (<Loading />)
  }

  if (isError) {
    handleError(error as any);
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
            return <PoemCard key={poem.id} path={`/poems/${poem.id}`} name={poem.title} />
          }) 
        }
      </CardGrid>
    </Shell>
  )
}