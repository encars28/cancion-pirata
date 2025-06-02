import { CollectionBasic } from "../../client";
import { Text, Paper, Group, Grid, Image, Space } from "@mantine/core";
import classes from "./CollectionGrid.module.css";
import { useNavigate } from "react-router";

export function CollectionGrid({
  collections,
}: {
  collections: CollectionBasic[];
}) {
  const navigate = useNavigate();
  return (
    <Grid gutter="xl" align="center" w="100%">
      {collections.map((collection) => (
        <Grid.Col key={collection.id} span={{ base: 12, md: 6 }}>
          <Paper
            shadow="xs"
            withBorder
            className={classes.paper}
            onClick={() => navigate(`/collections/${collection.id}`)}
          >
            <Group gap="lg">
                <Image src="/src/assets/bookshelf.png" w={35} mt="xl " />
              <Text  fw="bold">
                {collection.name}
              </Text>
              </Group>
              <Space h="lg" />
              <Text  size="sm">{collection.description ?? ""}</Text>
          </Paper>
        </Grid.Col>
      ))}
    </Grid>
  );
}
