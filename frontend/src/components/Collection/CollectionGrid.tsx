import { CollectionBasic } from "../../client";
import { Text, Paper, Group, Grid, Space, Image } from "@mantine/core";
import classes from "./CollectionGrid.module.css";
import { useNavigate } from "react-router";
import { TbBooks } from "react-icons/tb";

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
              {/* <TbBooks size={30} /> */}
              <Image src="/src/assets/bookshelf.png" w={40}/>
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
