import { Hero } from "../components/MainBanner/Hero";
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
  Affix,
  ActionIcon,
  Tooltip,
  Paper,
} from "@mantine/core";
import { useNavigate } from "react-router";
import { TbWritingSign, TbUser } from "react-icons/tb";
import { AuthorBadge } from "../components/Author/AuthorBadge/AuthorBadge";
import { notifications } from "@mantine/notifications";
import { errorNotification } from "../notifications";
import { isLoggedIn } from "../hooks/useAuth";

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

  if (isPending) {
    return (
      <Shell noPaddingTop>
        <Hero />
        <LoadingOverlay
          loaderProps={{ type: "dots" }}
          pos="relative"
          mt={100}
        ></LoadingOverlay>
      </Shell>
    );
  }

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
    <>
      <Shell noPaddingTop>
        <Hero />
        {poem && (
          <SimpleGrid
            cols={{ base: 1, md: 2 }}
            spacing="xl"
            verticalSpacing={120}
            h="100%"
            w="100%"
          >
            <Group gap={0} w="100%">
              <Group
                pb={120}
                pt={100}
                px={100}
                wrap="nowrap"
                h="100%"
                justify="center"
                style={{ backgroundColor: "var(--mantine-color-blue-1)" }}
              >
                <Paper withBorder shadow="md" p="xl" radius="md">
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
                        <Stack align="center" justify="center" gap="xs">
                          {poem.author_ids?.map((author, index) => (
                            <AuthorBadge
                              variant="light"
                              authorId={author}
                              authorName={poem.author_names![index]}
                              key={author}
                            />
                          ))}
                        </Stack>
                      )}
                    </Stack>
                    <Group justify="center" mt="lg">
                      <Button
                        variant="default"
                        w={250}
                        onClick={() => navigate(`/poems/${poem.id}`)}
                      >
                        Ir al poema...
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              </Group>
              <Divider
                orientation="vertical"
                size="md"
                style={{ height: "100%" }}
              />
            </Group>

            <Container pb={120} pt={100} pr={50} w="100%" fluid>
              <Interweave content={poem.content} />
            </Container>
          </SimpleGrid>
        )}
        {isError && (
          <Title ta="center" c="dimmed" fw="lighter" order={3} mt={100}>
            No se pudo cargar el poema. Por favor, inténtalo de nuevo más tarde.
          </Title>
        )}
      </Shell>
      <Affix bottom={{ base: 100, xs: 60 }} right={{ base: 30, xs: 70 }}>
        <Tooltip label="Nuevo poema">
          <ActionIcon
            size={50}
            variant="filled"
            radius="xl"
            onClick={
              isLoggedIn()
                ? () => navigate("/poems/add")
                : () => navigate("/login")
            }
          >
            <TbWritingSign size={25} />
          </ActionIcon>
        </Tooltip>
      </Affix>
    </>
  );
}
