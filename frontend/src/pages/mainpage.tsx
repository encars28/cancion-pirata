import { Hero } from "../components/Hero/Hero";
import { Shell } from "../components/Shell/Shell";
import { Interweave } from "interweave";
import { useQuery } from "@tanstack/react-query";
import { callService, showError } from "../utils";
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
  Badge,
  Group,
  LoadingOverlay,
  Skeleton,
  Box,
} from "@mantine/core";
import { useNavigate } from "react-router";
import { useState } from "react";
import { TbUser } from "react-icons/tb";
import { AuthorBadge } from "../components/Author/AuthorBadge/AuthorBadge";

export function MainPage() {
  const navigate = useNavigate();
  const [overlay, setOverlay] = useState(true);

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

  // if (status === "success") {
  //   setOverlay(false);
  // }

  const poem = (data as PoemPublicWithAllTheInfo);

  return (
    <Shell>
      <Hero />
      <>
        {/* <LoadingOverlay
        visible={overlay}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{ type: "dots" }}
      /> */}
        {/* <Skeleton visible={overlay}> */}
          {/* {poem ? ( */}
            <SimpleGrid
              cols={{ base: 1, sm: 2 }}
              spacing="xl"
              verticalSpacing={120}
              mt={100}
              pb={150}
              ml={{ base: "xl", sm: 50, md: 100 }}
            >
              <Container w="100%" fluid>
                <Interweave content={poem.content} />
              </Container>
              <Stack gap="lg">
                <Title ta="center" order={2}>
                  {poem.title}
                </Title>
                {
                poem.author_names?.length === 0 ||
                poem.show_author === false ? (
                  <Group justify="center">
                    <Badge variant="default" size="lg">
                      <TbUser /> Anónimo
                    </Badge>
                  </Group>
                ) : (
                  <Group justify="center" gap="md">
                    {poem.author_ids?.map((author, index) => (
                      <AuthorBadge authorId={author} authorName={poem.author_names![index]} key={author} />
                    ))}
                  </Group>
                )}
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
            </SimpleGrid>
          {/* // ) : <Box h={300} w="100%" />} */}
          {/* ) : null } */}
        {/* // </Skeleton> */}
      </>
    </Shell>
  );
}
