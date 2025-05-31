import { TbUser } from "react-icons/tb";
import classes from "./PoemGrid.module.css";
import {
  Text,
  Group,
  Badge,
  Space,
  Paper,
  Grid,
  Image,
  Stack,
} from "@mantine/core";
import { PoemPublicWithAuthor } from "../../../client";
import { useNavigate } from "react-router";

export function ShowPoemGrid({ poems, show_author }: { poems: PoemPublicWithAuthor[], show_author?: boolean }) {
  const navigate = useNavigate();

  return (
    <Grid gutter="xl" align="center" w="100%">
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
                  {show_author ? 
                  poem.author_names?.length === 0 ||
                  poem.show_author === false ? (
                    <Badge variant="light">
                      <TbUser /> Anónimo
                    </Badge>
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
                  ) : null}
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
                Idioma: {poem.language ? poem.language : "Desconocido"}
              </Text>
              <Text c="dimmed" size="sm">
                Creado: {poem.created_at?.toLocaleDateString("es-ES")}
              </Text>
              <Text c="dimmed" size="sm">
                Modificado: {poem.updated_at?.toLocaleDateString("es-ES")}
              </Text>
            </Group>
          </Paper>
        </Grid.Col>
      ))}
    </Grid>
  );
}
