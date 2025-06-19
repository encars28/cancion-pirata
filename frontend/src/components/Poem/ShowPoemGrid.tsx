import {
  Stack,
} from "@mantine/core";
import { PoemPublic } from "../../client";
import { PoemCard } from "./PoemCard/PoemCard";

export function ShowPoemGrid({
  poems,
  show_author,
  collectionId,
  removePoem = false
}: {
  poems: PoemPublic[];
  show_author?: boolean;
  collectionId?: string;
  removePoem?: boolean;
}) {
  return (
    <Stack w="100%" gap="xl">
      {poems.map((poem) => (
          <PoemCard
            key={poem.id}
            poem={poem}
            show_author={show_author}
            collectionId={collectionId}
            removePoemCollection={removePoem}
          />
      ))}
    </Stack>
  );
}
