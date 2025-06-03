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
  Divider,
  HoverCard,
} from "@mantine/core";
import usePoem from "../hooks/usePoem";
import usePoemActions from "../hooks/usePoemActions";
import { modals } from "@mantine/modals";
import {
  TbBooks,
  TbEdit,
  TbMessageLanguage,
  TbPlus,
  TbPoint,
  TbPointFilled,
  TbTrash,
} from "react-icons/tb";
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
        <Text size="sm">
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
              Crear colección y añadir poema
            </Button>
          </Stack>
        ),
    });

  return (
    <Shell>
      <Stack justify="center" align="center" my={50} gap="sm">
        <Group gap={50}>
          {poem.original && poem.type == PoemType.TRANSLATION && (
            <HoverCard width={250}>
              <HoverCard.Target>
                <ActionIcon variant="light" radius="xl" size={60}>
                  <TbMessageLanguage size={30} />
                </ActionIcon>
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <Text size="sm">
                  Este poema es una traducción de{" "}
                  <Anchor
                    underline="hover"
                    target="_blank"
                    onClick={() => navigate(`/poems/${poem.original?.id}`)}
                  >
                    {poem.original.title}
                  </Anchor>
                </Text>
              </HoverCard.Dropdown>
            </HoverCard>
          )}
          {poem.original && poem.type == PoemType.VERSION && (
            <HoverCard width={250}>
              <HoverCard.Target>
                <ActionIcon variant="light" radius="xl" size={60}>
                  <TbMessageLanguage size={30} />
                </ActionIcon>
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <Text size="sm">
                  Este poema es una versión de{" "}
                  <Anchor
                    underline="hover"
                    target="_blank"
                    onClick={() => navigate(`/poems/${poem.original?.id}`)}
                  >
                    {poem.original.title}
                  </Anchor>
                </Text>
              </HoverCard.Dropdown>
            </HoverCard>
          )}
          <Stack>
            <Title ta="center" order={1}>
              {poem.title}
            </Title>
            <Title ta="center" order={3} c="dimmed" fw="lighter">
              Escrito por:{" "}
              {poem.author_names?.length === 0
                ? "Anónimo"
                : poem.author_ids?.map((author, index) => (
                    <Anchor
                      key={author}
                      underline="hover"
                      target="_blank"
                      c="dimmed"
                      fw="lighter"
                      size="xl"
                      onClick={() => navigate(`/authors/${author}`)}
                    >
                      {poem.author_names?.[index] + " "}
                    </Anchor>
                  ))}
            </Title>
          </Stack>
        </Group>
        {poem.description && (
          <Text mt="lg" ta="center" size="md" fw="lighter">
            {poem.description}
          </Text>
        )}
        {/* <Divider w="100%" mt="xl" /> */}
        <Space h={50} />
        <Container w={600}>
          <Interweave content={poem.content} />
        </Container>
        <Space h={50} />
        <Group c="dimmed" justify="center" gap="lg">
          <Text size="sm">Idioma: {poem.language}</Text>
          <TbPointFilled size={6} />
          <Text size="sm">
            Fecha de publicación: {poem.created_at?.toLocaleDateString()}
          </Text>
          <TbPointFilled size={6} />
          <Text size="sm">
            Fecha de modificación: {poem.updated_at?.toLocaleDateString()}
          </Text>
        </Group>
        {currentUser && (
          <Stack
            gap="xs"
            p={50}
            w="100%"
            align="flex-end"
            style={{ bottom: "0px", position: "fixed" }}
          >
            <Tooltip label="Añadir a colección">
              <ActionIcon
                variant="filled"
                size={35}
                color="green"
                onClick={addPoemToCollectionModal}
              >
                <TbPlus size={20} />
              </ActionIcon>
            </Tooltip>
            {((poem.author_ids &&
              currentUser?.author_id &&
              poem.author_ids.includes(currentUser?.author_id)) ||
              currentUser?.is_superuser) && (
              <>
                <Tooltip label="Editar">
                  <ActionIcon
                    variant="filled"
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
          </Stack>
        )}
      </Stack>
    </Shell>
  );
}
