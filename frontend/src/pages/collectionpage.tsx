import { useNavigate, useParams } from "react-router";
import { Shell } from "../components/Shell/Shell";
import { useQuery } from "@tanstack/react-query";
import { callService, FetchError } from "../utils";
import {
  CollectionPublicWithPoems,
  collectionsReadCollection,
  PoemPublicBasic,
} from "../client";
import { Loading } from "../components/Loading";
import {
  Title,
  Text,
  Stack,
  Container,
  Tooltip,
  ActionIcon,
  MultiSelect,
  Button,
  Menu,
} from "@mantine/core";
import useCollectionActions from "../hooks/useCollectionActions";
import { modals } from "@mantine/modals";
import useAuth from "../hooks/useAuth";
import { TbBook, TbEdit, TbTrash, TbWritingSign, TbDots } from "react-icons/tb";
import { ShowPoemGrid } from "../components/Poem/ShowPoemGrid";
import { Form, useForm } from "@mantine/form";
import { EditCollection } from "../components/Collection/EditCollection";
import useSearch from "../hooks/useSearch";
import { notifications } from "@mantine/notifications";
import { errorNotification, successNotification } from "../notifications";
import { Navigate } from "react-router";
import { QueryError } from "../components/Error/QueryError";
import { isLoggedIn } from "../hooks/useAuth";
import { Affix } from "@mantine/core";

export function CollectionPage() {
  const params = useParams();
  const collectionId = params.id;
  const { deleteCollectionMutation, addPoemToCollection } =
    useCollectionActions(collectionId!);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate()

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      poems: [],
    },
    enhanceGetInputProps: () => ({
      disabled: addPoemToCollection.isPending,
    }),
  });

  const { data: searchData } = useSearch({ search_type: ["poem"] });
  const poemsData = searchData?.poems as PoemPublicBasic[];

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
    notifications.show(
      errorNotification({
        title: "Error al cargar la colección",
        description: error.message || "No se pudo cargar la colección.",
      })
    );

    if (error instanceof FetchError) {
      return <QueryError status={error.res.status} />;
    }

    return <Navigate to="/" replace />;
  }

  const collection: CollectionPublicWithPoems = data!;
  const poems_info = Object.fromEntries(
    poemsData?.map((poem) => [
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
      notifications.show(
        successNotification({
          title: "Poema(s) añadido(s)",
          description:
            "El poema(s) se ha añadido a la colección correctamente.",
        })
      );
    } catch {
      //
    }
  };

  const deleteCollection = () =>
    modals.openConfirmModal({
      title: "Eliminar colección",
      children: (
        <Text size="sm">
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
            mt="xl"
            fullWidth
            loading={addPoemToCollection.isPending}
          >
            Añadir poema(s)
          </Button>
        </Form>
      ),
    });

  const editCollection = () =>
    modals.open({
      title: "Editar colección",
      children: <EditCollection collection={collection} />,
    });

  return (
    <Shell>
      <Stack mt={60} gap={50}>
        <Stack gap="xs">
          <Title ta="center" order={1}>
            {collection.name}
          </Title>
          <Text ta="center" c="dimmed" size="md">
            Creado por: {collection.username}
          </Text>
        </Stack>
        <Text ta="center" size="md">
          {collection.description ?? ""}
        </Text>
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
          <Title ta="center" order={3} mt={80} c="dimmed" fw="lighter">
            Esta colección todavía no tiene poemas.
          </Title>
        )}
      </Container>
      <Affix bottom={{ base: 100, xs: 60 }} right={{ base: 30, xs: 70 }}>
        <Stack align="center" justify="center" gap="md">
          {(currentUser?.id === collection.user_id ||
          currentUser?.is_superuser) && (
    <Menu position="top" transitionProps={{ transition: "pop" }} withArrow>
      <Menu.Target>
        <ActionIcon
          variant="light"
          style={{ backgroundColor: "#d0ebff" }}
          size="lg"
          radius="xl"
        >
          <TbDots size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<TbBook size={16} />}
          onClick={selectPoem}
        >
          Añadir poema
        </Menu.Item>

            <Menu.Item leftSection={<TbEdit size={16} />} onClick={editCollection}>
              Editar colección
            </Menu.Item>
            <Menu.Item
              leftSection={<TbTrash size={16} />}
              color="red"
              onClick={deleteCollection}
            >
              Eliminar colección
            </Menu.Item>
      </Menu.Dropdown>
    </Menu>
          )}

          <Tooltip label="Nuevo poema">
            <ActionIcon
              size={50}
              variant="filled"
              radius="xl"
              onClick={
                isLoggedIn()
                  ? () => navigate("/poems/add")
                  : () => navigate("/login")
              }
            >
              <TbWritingSign size={25} />
            </ActionIcon>
          </Tooltip>
        </Stack>
      </Affix>
    </Shell>
  );
}
