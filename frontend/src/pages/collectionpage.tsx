import { useParams } from "react-router";
import { Shell } from "../components/Shell/Shell";
import { useQuery } from "@tanstack/react-query";
import { callService, handleError } from "../utils";
import { CollectionPublic, collectionsReadCollection } from "../client";
import { Loading } from "../components/Loading";
import { Title, Text, Stack, Container, Group, Tooltip, ActionIcon } from "@mantine/core";
import { ShowPoemGrid } from "../components/Poem/PoemGrid/ShowPoemGrid";
import useCollectionActions from "../hooks/useCollectionActions";
import { modals } from "@mantine/modals";
import useAuth from "../hooks/useAuth";
import { TbPencil, TbTrash } from "react-icons/tb";

export function CollectionPage() {
  const params = useParams();
  const collectionId = params.id;
  const { deleteCollectionMutation } = useCollectionActions(collectionId!);
  const { user: currentUser } = useAuth();

  const { data, error, isPending, isError } = useQuery({
    queryKey: ["collections", collectionId],
    queryFn: async () =>
      callService(collectionsReadCollection, {
        path: { collection_id: collectionId! },
      }),
    placeholderData: (prevData) => prevData,
  });

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    handleError(error as any);
  }

  const collection: CollectionPublic = data!;

  const deleteCollection = () =>
    modals.openConfirmModal({
      title: "Por favor confirme su acción",
      children: (
        <Text size="sm" ta="left">
          ¿Está seguro de que desea borrar este elemento? La acción es
          irreversible
        </Text>
      ),
      onConfirm: async () => deleteCollectionMutation.mutateAsync(),
      confirmProps: { color: "red" },
      labels: { confirm: "Eliminar", cancel: "Cancelar" },
    });

  return (
    <Shell>
      <Stack mt={60}>
        <Title order={1}>{collection.name}</Title>
        <Text size="md">
          {collection.description ?? ""}
        </Text>
        {(currentUser?.id === collection.user_id || currentUser?.is_superuser) && (
          <Group mt="sm" justify="center">
            <Tooltip label="Editar">
              <ActionIcon
                variant="outline"
                size="lg"
              >
                <TbPencil size={20} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Eliminar">
              <ActionIcon
                variant="filled"
                color="red"
                size="lg"
                onClick={deleteCollection}
              >
                <TbTrash size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
      </Stack>
      <Container mx={{ base: "xl", lg: 50 }} mb="xl" mt={60} fluid>
        <ShowPoemGrid poems={collection.poems ?? []} />
      </Container>
    </Shell>
  );
}
