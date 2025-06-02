import { Shell } from "../components/Shell/Shell";
import { handleError } from "../utils";
import { PoemPublicWithAllTheInfo } from "../client/types.gen";
import { Loading } from "../components/Loading";
import { useNavigate, useParams } from "react-router";
import useAuth from "../hooks/useAuth";
import {
  List,
  Title,
  Container, 
  Flex,
  Stack,
  Text,
  Space,
  Group,
  ActionIcon,
  Tooltip,
  Anchor,
  Button,
} from "@mantine/core";
import usePoem from "../hooks/usePoem";
import usePoemActions from "../hooks/usePoemActions";
import { modals } from "@mantine/modals";
import { TbBooks, TbEdit, TbTrash } from "react-icons/tb";
import { Interweave } from "interweave";
import { InfoBox } from "../components/InfoBox";
import { AddCollection } from "../components/Collection/AddCollection";
import { AddPoemToCollection } from "../components/Collection/AddPoemToCollection/AddPoemToCollection";

enum PoemType {
  TRANSLATION = 0,
  VERSION = 1,
}

export function PoemPage() {
  const params = useParams();
  const poemId = params.id;
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { deletePoemMutation } = usePoemActions(poemId!);

  const addPoemModal = () =>
    modals.open({
      title: "Crear colección",
      children: <AddCollection />,
    });

  const { isPending, isError, data, error } = usePoem(poemId!, true);

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    navigate("/poems");
    handleError(error as any);
  }

  const poem: PoemPublicWithAllTheInfo = data!;

  const deletePoem = () =>
    modals.openConfirmModal({
      title: "Eliminar poema",
      children: (
        <Text size="sm" >
          ¿Está seguro de que desea borrar este poema? La acción es {""}
          <Text component="span" fw="bolder" inherit>
            irreversible
          </Text>
          .
        </Text>
      ),
      onConfirm: async () => deletePoemMutation.mutateAsync(),
      confirmProps: { color: "red" },
      labels: { confirm: "Eliminar", cancel: "Cancelar" },
    });

  const addPoemToCollectionModal = () =>
    modals.open({
      title: "Añadir poema a colección",
      children:
        currentUser?.collections && currentUser?.collections?.length > 0 ? (
          <AddPoemToCollection poemId={poem.id} />
        ) : (
          <Stack p="lg" mt="md" justify="center">
            <Title order={4} ta="center" c="dimmed" fw="lighter">
              No hay colecciones creadas.
            </Title>
            <Button variant="filled" mt="xl" onClick={addPoemModal}>
              Crear colección
            </Button>
          </Stack>
        ),
    });

  return (
    <Shell>
      <Space h="xl" />
      <Flex justify="center" wrap="wrap" mt="xl">
        <Flex
          justify="center"
          align="center"
          direction="column"
          gap="xl"
          mt="xl"
          w={{ base: "100%", sm: "60%" }}
        >
          <Container fluid>
            <Title ta="center" order={1}>{poem.title}</Title>
            <Title ta="center" order={3} mt="xs" c="dimmed" fw="lighter">
              Autor:{" "}
              {poem.author_names?.length == 0
                ? "Anónimo"
                : poem.author_names?.join(", ")}
            </Title>
            {currentUser && (
              <Group justify="center" mt="lg" gap="xs">
                <Tooltip label="Añadir a colección">
                  <ActionIcon
                    variant="light"
                    size={35}
                    color="green"
                    onClick={addPoemToCollectionModal}
                  >
                    <TbBooks size={20} />
                  </ActionIcon>
                </Tooltip>
                {((poem.author_ids &&
                  currentUser?.author_id &&
                  poem.author_ids.includes(currentUser?.author_id)) ||
                  currentUser?.is_superuser) && (
                  <>
                    <Tooltip label="Editar">
                      <ActionIcon
                        variant="light"
                        size={35}
                        onClick={() => navigate(`/poems/edit/${poem.id}`)}
                      >
                        <TbEdit size={20} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Eliminar">
                      <ActionIcon color="red" size={35} onClick={deletePoem}>
                        <TbTrash size={20} />
                      </ActionIcon>
                    </Tooltip>
                  </>
                )}
              </Group>
            )}

            {/* <Paper
            shadow="xs"
            withBorder
            className={classes.paper}
            // onClick={() => navigate(`/poems/${poem.id}`)}
          >
            <Group justify="space-between" align="center" mb="md">
              <Group gap="lg">
                <Image src="/src/assets/scroll.png" w={40} mt="xl " />
                <Stack gap="xs">
                  <Text  fw="bold">
                    {poem.title}
                  </Text>
                  {poem.author_names?.length === 0 ||
                  poem.show_author === false ? (
                    <Badge variant="light">
                      <TbUser /> Anónimo
                    </Badge>
                  ) : (
                    <Group gap="lg">
                      {poem.author_ids?.map((author, index) => (
                        <Badge
                          key={index}
                          onClick={() => navigate(`/authors/${author}`)}
                          variant="light"
                          className={classes.link}
                        >
                          <TbUser />
                          {" " + poem.author_names?.[index]}
                        </Badge>
                      ))}
                    </Group>
                  )}
                </Stack>
              </Group>
              <Text ta="right" c="dimmed">
                {poem.type === null
                  ? "Original"
                  : poem.type === 0
                  ? "Traducción"
                  : poem.type === 1
                  ? "Versión"
                  : poem.type === 2
                  ? "Derivado"
                  : ""}
              </Text>
            </Group>
            <Space h="xl" />
            <Group justify="flex-end" gap="xl">
            <Text c="dimmed" size="sm">
                Idioma: {poem.language ? poem.language : "Desconocido"}
              </Text>
              <Text c="dimmed" size="sm">
                Creado: {poem.created_at?.toLocaleDateString("es-ES")}
              </Text>
              <Text c="dimmed" size="sm">
                Modificado: {poem.updated_at?.toLocaleDateString("es-ES")}
              </Text>
            </Group>
          </Paper> */}
          </Container>
          <Container w="100%">
            <Interweave content={poem.content} />
          </Container>
          <Space h="xl" />
        </Flex>
        <Stack>
          {poem.original && poem.type == PoemType.TRANSLATION && (
            <InfoBox>
              <Text>Este poema es una traducción.</Text>
              <Anchor onClick={() => navigate(`/poems/${poem.original!.id}`)}>
                Ver poema original
              </Anchor>
            </InfoBox>
          )}
          {poem.original && poem.type == PoemType.VERSION && (
            <InfoBox>
              <Text>Este poema es una versión.</Text>
              <Anchor onClick={() => navigate(`/poems/${poem.original!.id}`)}>
                Ver poema original
              </Anchor>
            </InfoBox>
          )}
          {poem.derived_poems && poem.derived_poems.length > 0 && (
            <InfoBox>
              <Text>Este poema tiene derivados.</Text>
              <List  withPadding>
                {poem.derived_poems.map((derivedPoem) => (
                  <List.Item key={derivedPoem.id}>
                    <Anchor
                      onClick={() => navigate(`/poems/${derivedPoem.id}`)}
                    >
                      {derivedPoem.title}
                    </Anchor>
                  </List.Item>
                ))}
              </List>
            </InfoBox>
          )}
        </Stack>
      </Flex>
    </Shell>
  );
}
