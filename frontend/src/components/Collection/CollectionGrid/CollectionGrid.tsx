import { CollectionPublic } from "../../../client";
import { Text, Paper, Stack, Group, Grid } from "@mantine/core";
import classes from "./CollectionGrid.module.css";
import { useNavigate } from "react-router";
import { TbBookmarksFilled } from "react-icons/tb";

export function CollectionGrid({
  collections,
}: {
  collections: CollectionPublic[];
}) {
  const navigate = useNavigate();
  return (
    <Grid gutter="xl" align="center" w="100%">
      {collections.map((collection) => (
        <Grid.Col key={collection.id} span={{ base: 12, md: 6 }}>
          <Paper
            shadow="xs"
            h={193}
            withBorder
            className={classes.paper}
            onClick={() => navigate(`/collections/${collection.id}`)}
          >
            <Stack h="100%" justify="space-around" gap={0}>
              <Group gap="md" wrap="nowrap" >
                <TbBookmarksFilled size={35} />
                <Text lineClamp={1} size="lg" fw="bold">
                  {collection.name}
                </Text>
              </Group>

              {collection.description ? (
                  <Text lineClamp={3} size="sm" ml="md">
                    {collection.description}
                  </Text>
              ) : (
                  <Text lineClamp={3} ta="center" size="sm" c="dimmed">
                    Esta colección no tiene descripción todavía
                  </Text>
              )}
              <div></div>
            </Stack>
          </Paper>
        </Grid.Col>
      ))}
    </Grid>
  );
}
