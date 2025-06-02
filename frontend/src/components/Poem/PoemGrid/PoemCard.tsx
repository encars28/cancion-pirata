import {
  ActionIcon,
  Badge,
  Card,
  Group,
  Image,
  Paper,
  Space,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { TbUser, TbX } from "react-icons/tb";
import { PoemPublicWithAuthor } from "../../../client";
import { useNavigate } from "react-router";
import classes from "./PoemGrid.module.css";
import { modals } from "@mantine/modals";
import useCollectionActions from "../../../hooks/useCollectionActions";

interface PoemCardProps {
  poem: PoemPublicWithAuthor;
  show_author?: boolean;
  collectionId?: string;
  removePoemCollection?: boolean;
}

export function PoemCard({
  poem,
  show_author = true,
  collectionId,
  removePoemCollection = false,
}: PoemCardProps) {
  const navigate = useNavigate();
  let removePoemCollectionModal: () => any = () => {};

  if (collectionId) {
    const { removePoemFromCollection } =
      useCollectionActions(collectionId);

    removePoemCollectionModal = () =>
      modals.openConfirmModal({
        title: "Quitar poema de la colección",
        children: (
          <Text size="sm">
            ¿Está seguro de que desea eliminar este poema de la colección? La
            acción es {""}
            <Text component="span" fw="bolder" inherit>irreversible</Text>.
          </Text>
        ),
        onConfirm: async () => removePoemFromCollection.mutateAsync(poem.id),
        confirmProps: { color: "red" },
        labels: { confirm: "Eliminar", cancel: "Cancelar" },
      });
  }

  const handleButtonClick = (event) => {
    event.stopPropagation();
    removePoemCollectionModal();
  }

  return (
    <Card
      shadow="xs"
      withBorder
      className={classes.paper}
      w="100%"
      h="100%"
      onClick={() => navigate(`/poems/${poem.id}`)}
    >
      <Card.Section>
      <Group justify="space-between" align="center" mb="md">
        <Group gap="lg">
          <Image src="/src/assets/scroll.png" w={40} mt="xl " />
          <Stack gap="xs">
            <Text fw="bold">
              {poem.title}
            </Text>
            {show_author ? (
              poem.author_names?.length === 0 || poem.show_author === false ? (
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
              )
            ) : null}
          </Stack>
        </Group>
        {removePoemCollection && collectionId && (
          <Tooltip label="Quitar de la colección">
            <ActionIcon
              variant="light"
              color="red"
              size="lg"
              onClick={handleButtonClick}
            >
              <TbX size={20} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
      </Card.Section>
      <Space h="xl" />
      <Group justify="flex-end" gap="xl">
        <Text size="sm" c="dimmed">
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
    </Card>
  );
}
