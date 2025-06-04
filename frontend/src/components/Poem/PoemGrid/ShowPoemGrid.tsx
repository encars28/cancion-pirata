import {
  Stack,
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
    <Stack w="100%" gap="xl">
      {poems.map((poem) => (
          <PoemCard
            poem={poem}
            show_author={show_author}
            collectionId={collectionId}
            removePoemCollection={removePoem}
          />
      ))}
    </Stack>
  );
}
