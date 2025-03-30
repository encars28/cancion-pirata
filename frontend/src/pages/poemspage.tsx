import { Shell } from "../components/Shell/Shell";
import { CardGrid, CardGridProps } from "../components/CardGrid";
import { Title, Image, Text } from "@mantine/core";
import { handleError } from "../utils";
import { Loading } from "../components/Loading";
import { PoemPublicWithAllTheInfo } from "../client";
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

  const cardData: CardGridProps[] = poems.map((poem) => ({
    path: `/poems/${poem.id}`,
    icon: <Image src="/src/assets/Cat03.jpg" fit="contain" w={100} />,
    description: <Text mt="md" size="sm">{poem.title}</Text>
  }))

  return (
    <Shell>
      <Title mt={40} order={1}>Lista de poemas</Title>
      <Title order={2} c="dimmed" fw="inherit">Total: {authorCount}</Title>
      <CardGrid data={cardData} />
    </Shell>
  )
}