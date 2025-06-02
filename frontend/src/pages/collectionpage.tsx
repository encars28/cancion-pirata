import { useParams } from "react-router";
import { Shell } from "../components/Shell/Shell";
import { useQuery } from "@tanstack/react-query";
import { callService, handleError, handleSuccess } from "../utils";
import { CollectionPublic, collectionsReadCollection } from "../client";
import { Loading } from "../components/Loading";
import {
  Title,
  Text,
  Stack,
  Container,
  Group,
  Tooltip,
  ActionIcon,
  MultiSelect,
  Button,
} from "@mantine/core";
import useCollectionActions from "../hooks/useCollectionActions";
import { modals } from "@mantine/modals";
import useAuth from "../hooks/useAuth";
import { TbBooks, TbEdit, TbTrash } from "react-icons/tb";
import { ShowPoemGrid } from "../components/Poem/PoemGrid/ShowPoemGrid";
import { Form, useForm } from "@mantine/form";
import usePoems from "../hooks/usePoems";
import { EditCollection } from "../components/Collection/EditCollection";


export function CollectionPage() {
  const params = useParams();
  const collectionId = params.id;
  const { deleteCollectionMutation, addPoemToCollection } =
    useCollectionActions(collectionId!);
  const { user: currentUser } = useAuth();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      poems: [],
    },
    enhanceGetInputProps: () => ({
      disabled: addPoemToCollection.isPending,
    }),
  });

  const { data: poemsData } = usePoems({});

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
  const poems_info = Object.fromEntries(
    poemsData?.data?.map((poem) => [
      `${poem.title} ${
        poem.author_names && poem.author_names?.length > 0 ? " - " : ""
      } ${poem.author_names?.join(", ")}`,
      poem.id,
    ]) ?? []
  );

  const handleSubmit = async (values: typeof form.values) => {
    try {
      values.poems.forEach(async (poem) => {
        await addPoemToCollection.mutateAsync(poems_info[poem]);
        modals.closeAll();
      });
      handleSuccess();
    } catch {
      //
    }
  };

  const deleteCollection = () =>
    modals.openConfirmModal({
      title: "Eliminar colección",
      children: (
        <Text size="sm" ta="left">
          ¿Está seguro de que desea eliminar esta colección? La acción es {""}
          <Text component="span" fw="bolder" inherit>
            irreversible
          </Text>
        </Text>
      ),
      onConfirm: async () => deleteCollectionMutation.mutateAsync(),
      confirmProps: { color: "red" },
      labels: { confirm: "Eliminar", cancel: "Cancelar" },
    });

  const selectPoem = () =>
    modals.open({
      title: "Añadir poema a la colección",
      children: (
        <Form form={form} onSubmit={handleSubmit}>
          <MultiSelect
            data={Object.keys(poems_info)}
            label="Poemas"
            ta="left"
            placeholder="Seleccione uno o más poemas"
            searchable
            nothingFoundMessage="No se encontraron poemas"
            key={form.key("poems")}
            required
            clearable
            withCheckIcon={false}
            limit={10}
            {...form.getInputProps("poems")}
          />
          <Button
            type="submit"
            variant="filled"
            color="green"
            mt="xl"
            fullWidth
            loading={addPoemToCollection.isPending}
          >
            Añadir poema(s)
          </Button>
        </Form>
      ),
    });

  const editCollection = () => modals.open({
    title: "Editar colección", 
    children: (<EditCollection collection={collection} />),
  })

  return (
    <Shell>
      <Stack mt={60}>
        <Title order={1}>{collection.name}</Title>
        <Text size="md">{collection.description ?? ""}</Text>
        {(currentUser?.id === collection.user_id ||
          currentUser?.is_superuser) && (
          <Group mt="sm" justify="center">
            <Tooltip label="Añadir poema">
              <ActionIcon
                variant="light"
                size="lg"
                color="green"
                onClick={selectPoem}
              >
                <TbBooks size={20} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Editar colección">
              <ActionIcon
                variant="light"
                size="lg"
                onClick={editCollection}
              >
                <TbEdit size={20} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Eliminar colección">
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
        {collection.poems && collection.poems?.length > 0 ? (
          <ShowPoemGrid
            poems={collection.poems}
            collectionId={collectionId}
            removePoem
            show_author
          />
        ) : (
          <Title order={3} mt={80} c="dimmed" fw="lighter">
            Esta colección todavía no tiene poemas.
          </Title>
        )}
      </Container>
    </Shell>
  );
}
