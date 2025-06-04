import { Center, Loader } from "@mantine/core";
import { Shell } from "./Shell/Shell";

export function Loading() {
  return (
      <Center h={300} w="100%">
        <Loader />
      </Center>
  );
}
