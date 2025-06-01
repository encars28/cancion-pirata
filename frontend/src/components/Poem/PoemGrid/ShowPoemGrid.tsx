import {
  Grid,
} from "@mantine/core";
import { PoemPublicWithAuthor } from "../../../client";
import { PoemCard } from "./PoemCard";

export function ShowPoemGrid({
  poems,
  show_author,
  collectionId,
  removePoem = false
}: {
  poems: PoemPublicWithAuthor[];
  show_author?: boolean;
  collectionId?: string;
  removePoem?: boolean;
}) {
  return (
    <Grid gutter="xl" align="center" w="100%">
      {poems.map((poem) => (
        <Grid.Col key={poem.id} span={{ base: 12, md: 6 }}>
          <PoemCard
            poem={poem}
            show_author={show_author}
            collectionId={collectionId}
            removePoemCollection={removePoem}
          />
        </Grid.Col>
      ))}
    </Grid>
  );
}
