import { Hero } from "../components/Hero/Hero";
import { Shell } from "../components/Shell/Shell";
import { Interweave } from "interweave";
import { useQuery } from "@tanstack/react-query";
import { callService } from "../utils";
import { PoemPublicWithAllTheInfo, poemsReadRandomPoem } from "../client";
import {
  Container,
  SimpleGrid,
  Stack,
  Title,
  Button,
  Badge,
  Group,
  Divider,
  LoadingOverlay,
} from "@mantine/core";
import { useNavigate } from "react-router";
import { TbUser } from "react-icons/tb";
import { AuthorBadge } from "../components/Author/AuthorBadge/AuthorBadge";
import { notifications } from "@mantine/notifications";
import { errorNotification } from "../notifications";

export function MainPage() {
  const navigate = useNavigate();

  const { data, isPending, error, isError } = useQuery({
    queryKey: ["POD"],
    queryFn: async () => callService(poemsReadRandomPoem),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  if (isError) {
    notifications.clean();
    notifications.show(
      errorNotification({
        title: "Error al cargar el poema",
        description: error.message || "No se pudo cargar el poema aleatorio.",
      })
    );
  }

  const poem = data as PoemPublicWithAllTheInfo;

  return (
    <Shell noPaddingTop>
      <Hero />
      <LoadingOverlay
        visible={isPending}
        loaderProps={{ type: "dots" }}
        pos="relative"
        mt={100}
      >
        {poem && (
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
              <Divider
                visibleFrom="md"
                orientation="vertical"
                ml="xl"
                size="sm"
              />
            </Group>
            <Container mx={30} w="100%" fluid>
              <Interweave content={poem.content} />
            </Container>
          </SimpleGrid>
        )}
      </LoadingOverlay>
      {isError && (
        <Title ta="center" c="dimmed" fw="lighter" order={3} mt={100}>
          No se pudo cargar el poema. Por favor, inténtalo de nuevo más tarde.
        </Title>
      )}
    </Shell>
  );
}
