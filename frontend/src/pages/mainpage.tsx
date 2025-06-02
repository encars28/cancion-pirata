import { Hero } from "../components/Hero/Hero";
import { Shell } from "../components/Shell/Shell";
import { Interweave } from "interweave";
import { useQuery } from "@tanstack/react-query";
import { callService, handleError } from "../utils";
import { PoemPublicWithAllTheInfo, poemsReadRandomPoem } from "../client";
import { Loading } from "../components/Loading";
import {
  Container,
  Text,
  SimpleGrid,
  Stack,
  Title,
  Anchor,
  Button,
  Group,
} from "@mantine/core";
import { useNavigate } from "react-router";

export function MainPage() {
  const navigate = useNavigate();
  const { data, error, isPending, isError } = useQuery({
    queryKey: ["POD"],
    queryFn: async () => callService(poemsReadRandomPoem),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnReconnect: false,
    refetchOnMount: false
  });

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    handleError(error as any);
  }

  const poem = data as PoemPublicWithAllTheInfo;

  return (
    <Shell>
      <SimpleGrid 
        cols={{ base: 1, sm: 2 }} 
        spacing="xl" 
        verticalSpacing={120}
        mt={100} 
        pb={150}
        ml={{base: "xl", sm: 50, md: 100}}
      >
        <Container w="100%" fluid>
          <Interweave content={poem.content} />
        </Container>
        <Stack>
          <Title ta="center" order={2}>{poem.title}</Title>
          <Text ta="center" c="dimmed">
            Escrito por:{" "}
            {poem.author_names?.length === 0
              ? "Anónimo"
              : poem.author_ids?.map((author, index) => (
                  <Anchor
                    key={author}
                    underline="hover"
                    target="_blank"
                    c="dimmed"
                    onClick={() => navigate(`/authors/${author}`)}
                  >
                    {poem.author_names?.[index] + " "}
                  </Anchor>
                ))}
          </Text>
          <Group justify="center" mt="xl">
          <Button variant="default" w={250} onClick={() => navigate(`/poems/${poem.id}`)}>
            Ir al poema...
          </Button>
          </Group>
        </Stack>
      </SimpleGrid>
      <Hero />
    </Shell>
  );
}
