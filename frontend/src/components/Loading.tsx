import { Loader } from "@mantine/core";

export function Loading() {
  return (
    <Loader size="md" type="dots" style={{position: "fixed", top: "45%", left: "50%"}}/>
  );
}
