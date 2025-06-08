import { Hero } from "../components/Hero/Hero";
import { Shell } from "../components/Shell/Shell";
import { Interweave } from "interweave";
import { useQuery } from "@tanstack/react-query";
import { callService } from "../utils";
import { PoemPublicWithAllTheInfo, poemsReadRandomPoem } from "../client";
import { Loading } from "../components/Loading";
import {
  Container,
  SimpleGrid,
  Stack,
  Title,
  Button,
  Badge,
  Group,
  Divider,
} from "@mantine/core";
import { useNavigate } from "react-router";
import { TbUser } from "react-icons/tb";
import { AuthorBadge } from "../components/Author/AuthorBadge/AuthorBadge";

export function MainPage() {
  const navigate = useNavigate();

  const { data, isPending } = useQuery({
    queryKey: ["POD"],
    queryFn: async () => callService(poemsReadRandomPoem),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  if (isPending) {
    return <Loading />;
  }

  const poem = data as PoemPublicWithAllTheInfo;

  return (
    <Shell noPaddingTop>
      <Hero />
      <>
        <SimpleGrid
          cols={{ base: 1, md: 2 }}
          spacing="xl"
          verticalSpacing={120}
          mt={100}
          mx={50}
        >
          <Group wrap="nowrap" justify="center">
            <Stack h="100%" justify="space-around">
              <Stack gap="lg">
                <Title ta="center" order={2}>
                  {poem.title}
                </Title>
                {poem.author_names?.length === 0 ||
                poem.show_author === false ? (
                  <Group justify="center">
                    <Badge variant="default" size="lg">
                      <TbUser /> Anónimo
                    </Badge>
                  </Group>
                ) : (
                  <Group justify="center" gap="md">
                    {poem.author_ids?.map((author, index) => (
                      <AuthorBadge
                        authorId={author}
                        authorName={poem.author_names![index]}
                        key={author}
                      />
                    ))}
                  </Group>
                )}
              </Stack>
              <Group justify="center" mt="lg">
                <Button
                  variant="outline"
                  w={250}
                  onClick={() => navigate(`/poems/${poem.id}`)}
                >
                  Ir al poema...
                </Button>
              </Group>
            </Stack>
            <Divider visibleFrom="md" orientation="vertical" ml="xl" size="sm"/>
          </Group>
          <Container mx={30} w="100%" fluid>
            <Interweave content={poem.content} />
          </Container>
        </SimpleGrid>
      </>
    </Shell>
  );
}
