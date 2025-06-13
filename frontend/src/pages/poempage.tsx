import { Shell } from "../components/Shell/Shell";
import { PoemPublicWithAllTheInfo } from "../client/types.gen";
import { Loading } from "../components/Loading";
import { useNavigate, useParams, Navigate } from "react-router";
import useAuth from "../hooks/useAuth";
import {
  Title,
  Container,
  Stack,
  Text,
  Space,
  Group,
  ActionIcon,
  Tooltip,
  Anchor,
  Button,
  HoverCard,
  Badge,
} from "@mantine/core";
import usePoem from "../hooks/usePoem";
import usePoemActions from "../hooks/usePoemActions";
import { modals } from "@mantine/modals";
import {
  TbEdit,
  TbMessageLanguage,
  TbPlus,
  TbPointFilled,
  TbTrash,
  TbUser,
} from "react-icons/tb";
import { Interweave } from "interweave";
import { AddCollection } from "../components/Collection/AddCollection";
import { AddPoemToCollection } from "../components/Collection/AddPoemToCollection/AddPoemToCollection";
import { AuthorBadge } from "../components/Author/AuthorBadge/AuthorBadge";
import { notifications } from "@mantine/notifications";
import { errorNotification } from "../notifications";
import { FetchError } from "../utils";
import { QueryError } from "../components/ErrorPages/QueryError";

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
      children: <AddCollection redirect={false} poemId={poemId} />,
    });

  const { isPending, isError, data, error } = usePoem(poemId!, true);

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    navigate("/poems");
    notifications.show(
      errorNotification({
        title: "Error al cargar el poema",
        description: error.message,
      })
    );

    if (error instanceof FetchError) {
      return <QueryError status={error.res.status} />;
    }

    return <Navigate to="/" replace />;
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
      <Stack justify="center" align="center" gap="sm">
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
          <Stack gap="xl">
            <Title ta="center" order={1}>
              {poem.title}
            </Title>
            {poem.author_names?.length === 0 || poem.show_author === false ? (
              <Group justify="center">
                <Badge variant="light" size="lg">
                  <TbUser /> Anónimo
                </Badge>
              </Group>
            ) : (
              <Group justify="center" gap="md">
                {poem.author_ids?.map((author, index) => (
                  <AuthorBadge
                    variant="light"
                    authorId={author}
                    authorName={poem.author_names![index]}
                    key={author}
                  />
                ))}
              </Group>
            )}
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
            pr={80}
            w="100%"
            align="flex-end"
            style={{ bottom: "50px", position: "fixed" }}
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
