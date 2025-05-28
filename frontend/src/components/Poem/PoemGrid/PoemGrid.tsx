import {
  Grid,
  Image,
  Anchor,
  Pagination,
  Paper,
  Stack,
  Text,
  Group,
  Badge,
  Space,
} from "@mantine/core";
import React from "react";
import usePoems, { PoemQueryParams } from "../../../hooks/usePoems";
import { handleError } from "../../../utils";
import { Loading } from "../../Loading";
import { PoemPublicWithAuthor } from "../../../client";
import { POEMS_PER_PAGE } from "../../../pages/poemspage";
import classes from "./PoemGrid.module.css";
import { useNavigate } from "react-router";
import { TbUser } from "react-icons/tb";

export interface CardGridProps {
  path: string;
  icon: React.ReactNode;
  description: React.ReactNode;
}

export function PoemGrid({
  filter,
  setPage,
}: {
  filter: PoemQueryParams;
  setPage: (page: number) => void;
}) {
  const navigate = useNavigate();
  const { data, error, isPending, isError } = usePoems(filter);

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    handleError(error as any);
  }

  const poems = data?.data as PoemPublicWithAuthor[];
  const count = data?.count as number;

  return (
    <Stack
      align="center"
      gap={100}
      mt="xl"
      mb={60}
      mr="xl"
      ml={{ base: "xl", md: 60 }}
      w="100%"
    >
      <Grid gutter="xl">
        {poems.map((poem) => (
          <Grid.Col key={poem.id} span={{ base: 12, md: 6 }}>
            <Paper
              shadow="xs"
              withBorder
              className={classes.paper}
              onClick={() => navigate(`/poems/${poem.id}`)}
            >
              <Group justify="space-between" align="center" mb="md">
                <Group gap="lg">
                  <Image src="/src/assets/scroll.png" w={40} mt="xl " />
                  <Stack gap="xs">
                    <Text ta="left" fw="bold">
                      {poem.title}
                    </Text>
                      {poem.author_names?.length === 0 ||
                      poem.show_author === false ? (
                          <Badge variant="light"><TbUser /> Anónimo</Badge>
                      ) : (
                        <Group gap="lg">
                        {poem.author_ids?.map((author, index) => (
                          <Badge
                            key={index}
                            onClick={() => navigate(`/authors/${author}`)}
                            variant="light"
                            className={classes.link}
                          >
                            <TbUser />
                            {" " + poem.author_names?.[index]}
                          </Badge>
                        ))}
                        </Group>
                      )
                      }
                  </Stack>
                </Group>
                <Text ta="right" c="dimmed">
                  {poem.type === null
                    ? "Original"
                    : poem.type === 0
                    ? "Traducción"
                    : poem.type === 1
                    ? "Versión"
                    : poem.type === 2
                    ? "Derivado"
                    : ""}
                </Text>
              </Group>
              <Space h="xl" />
              <Group justify="flex-end" gap="xl">
                <Text c="dimmed" size="sm">
                  Idioma: {" "}
                  {poem.language ? poem.language : "Desconocido"}
                </Text>
                <Text c="dimmed" size="sm">
                  Creado: {" "}
                  {poem.created_at?.toLocaleDateString("es-ES")}
                </Text>
                <Text c="dimmed" size="sm">
                  Modificado: {" "}
                  {poem.updated_at?.toLocaleDateString("es-ES")}
                </Text>
              </Group>
            </Paper>
          </Grid.Col>
        ))}
      </Grid>
      <Pagination
        color="grey"
        siblings={3}
        total={
          count % POEMS_PER_PAGE === 0
            ? count / POEMS_PER_PAGE
            : Math.floor(count / POEMS_PER_PAGE) + 1
        }
        onChange={(page) => setPage(page)}
        disabled={count <= POEMS_PER_PAGE}
      />
    </Stack>
  );
}
