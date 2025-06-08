import {
  ActionIcon,
  Badge,
  Divider,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { TbUser, TbX } from "react-icons/tb";
import { PoemPublic } from "../../../client";
import { useNavigate } from "react-router";
import classes from "./PoemGrid.module.css";
import { modals } from "@mantine/modals";
import useCollectionActions from "../../../hooks/useCollectionActions";

interface PoemCardProps {
  poem: PoemPublic;
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
    const { removePoemFromCollection } = useCollectionActions(collectionId);

    removePoemCollectionModal = () =>
      modals.openConfirmModal({
        title: "Quitar poema de la colección",
        children: (
          <Text size="sm">
            ¿Está seguro de que desea eliminar este poema de la colección? La
            acción es {""}
            <Text component="span" fw="bolder" inherit>
              irreversible
            </Text>
            .
          </Text>
        ),
        onConfirm: async () => removePoemFromCollection.mutateAsync(poem.id),
        confirmProps: { color: "red" },
        labels: { confirm: "Eliminar", cancel: "Cancelar" },
      });
  }

  const handleButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    removePoemCollectionModal();
  };

  const handleAuthorClick = (event: React.MouseEvent, authorId: string) => {
    event.stopPropagation();
    navigate(`/authors/${authorId}`);
  };

  return (
    <Paper
      shadow="xs"
      withBorder
      className={classes.paper}
      w="100%"
      h={272}
      py="lg"
      px="xl"
      onClick={() => navigate(`/poems/${poem.id}`)}
    >
      <Stack justify="space-around" h="100%">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="lg" wrap="nowrap">
            <Image src="/src/assets/scroll.png" w={40} mt="xl " />
            <Stack gap={0}>
              <Text fw="bold" lineClamp={1}>
                {poem.title}
              </Text>
              {show_author ? (
                poem.author_names?.length === 0 ||
                poem.show_author === false ? (
                  <Group className={classes.authors_list}>
                    <Badge className={classes.link} variant="light">
                      <TbUser /> Anónimo
                    </Badge>
                  </Group>
                ) : (
                  <Group className={classes.authors_list}>
                    {poem.author_ids?.map((author, index) => (
                      <Badge
                        key={index}
                        onClick={(e) => handleAuthorClick(e, author)}
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
            <Tooltip label="Eliminar">
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
        {poem.description ? (
          <Text lineClamp={3} size="sm" ml="lg">
            {poem.description}
          </Text>
        ) : <Text c="dimmed" ta="center" size="sm" >Este poema no tiene descripción</Text>}
        <Stack gap={0}>
          <Divider mb="sm" />
          <Group justify="flex-end" wrap="nowrap" gap="xl">
            <Text size="sm" c="dimmed">
              Tipo:{" "}
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
        </Stack>
      </Stack>
    </Paper>
  );
}
