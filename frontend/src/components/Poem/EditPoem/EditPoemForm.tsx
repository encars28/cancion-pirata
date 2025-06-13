import {
  Fieldset,
  Collapse,
  NavLink,
  Group,
  Stack,
  TextInput,
  Textarea,
  Button,
  Container,
  MultiSelect,
  Select,
  Switch,
  Text,
} from "@mantine/core";
import {
  AuthorPublicBasic,
  PoemPublicBasic,
  PoemPublicWithAllTheInfo,
  PoemUpdate,
} from "../../../client/types.gen";
import { Form, isNotEmpty } from "@mantine/form";
import { useForm } from "@mantine/form";
import { poemsUpdatePoem } from "../../../client";
import {
  callService,
  PoemType,
} from "../../../utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuth from "../../../hooks/useAuth";
import {
  TbChevronRight,
  TbChevronDown,
  TbLock,
  TbSpy,
  TbUser,
  TbWorld,
} from "react-icons/tb";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router";
import { PoemHelp } from "../PoemHelp";
import useSearch from "../../../hooks/useSearch";
import { successNotification } from "../../Notifications/notifications";

export function EditPoemForm({ poem }: { poem: PoemPublicWithAllTheInfo }) {
  const [opened, { toggle }] = useDisclosure(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: PoemUpdate) =>
      callService(poemsUpdatePoem, { path: { poem_id: poem.id }, body: data }),
    onSuccess: () => {
      notifications.clean();
      navigate(`/poems/${poem.id}`);
      notifications.show(successNotification({title: "Poema actualizado", description: "El poema se ha actualizado correctamente"}));
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["poems"] });
      queryClient.invalidateQueries({ queryKey: ["authors"] });
    },
  });

  const form = useForm<PoemUpdate>({
    mode: "controlled",
    initialValues: {
      ...poem,
      original_poem_id: undefined,
      type: undefined,
      author_names: undefined,
    },
    validate: {
      title: isNotEmpty("El título no puede estar vacío"),
      content: isNotEmpty("El contenido no puede estar vacío"),
    },
    enhanceGetInputProps: () => ({
      disabled: mutation.isPending,
    }),
  });

  const { data: searchData } = useSearch({search_type: ["poem", "author"]})
  const authorsData = searchData?.authors as  AuthorPublicBasic[]
  const poemsData = searchData?.poems as PoemPublicBasic[]
  
  const author_names_info =
    authorsData?.map((author) => author.full_name) ?? [];
  const poems_info = Object.fromEntries(
    poemsData?.map((poem) => [
      `${poem.title} - ${poem.author_names?.join(", ")}`,
      poem.id,
    ]) ?? []
  );

  const typeData = [
    {
      value: PoemType.TRANSLATION + "",
      label: "Traducción",
    },
    {
      value: PoemType.VERSION + "",
      label: "Versión",
    },
    {
      value: -1 + "",
      label: "Original",
    },
  ];
  const { user: currentUser } = useAuth();

  const handleSubmit = async () => {
    try {
      if (form.isDirty()) {
        const values = form.getValues();

        if (values.language === "") {
          values.language = undefined;
        }

        if (values.type == -1) {
          values.type = undefined;
        }

        if (
          values.original_poem_id !== undefined &&
          values.original_poem_id !== null
        ) {
          values.original_poem_id =
            poems_info[values.original_poem_id] ?? undefined;
        }

        await mutation.mutateAsync(values);
        form.resetDirty();
      }
    } catch {
      // error is handled by mutation
    }
  };

  return (
    <Container py={50}>
      <Form form={form} onSubmit={handleSubmit}>
        <Stack gap="xs">
          <TextInput
            name="title"
            key={form.key("title")}
            label="Título"
            placeholder="Tu título"
            {...form.getInputProps("title")}
          />
          <TextInput
            name="language"
            key={form.key("language")}
            label="Idioma"
            placeholder="es"
            {...form.getInputProps("language")}
          />

          {/* <Tabs variant="outline" defaultValue="editor">
              <Tabs.List>
                <Tabs.Tab value="richEditor">
                  Editor de texto
                </Tabs.Tab> 
                <Tabs.Tab value="editor">
                  Editor de lenguaje de marcado
                </Tabs.Tab>
              </Tabs.List> */}
          {/* <Tabs.Panel value="richEditor">
                <Input
                  mt="lg"
                  component={PoemTextEditor}
                  content={poem.content}
                  key={form.key('content')}
                  {...form.getInputProps('content')}
                />
              </Tabs.Panel> */}
          {/* <Tabs.Panel value="editor"> */}
          <Textarea
            autosize
            maxRows={15}
            name="content"
            key={form.key("content")}
            placeholder="Tu contenido"
            label="Contenido"
            {...form.getInputProps("content")}
          />
          <PoemHelp />
          {/* </Tabs.Panel>
            </Tabs> */}

          <Stack mt="md" gap={5}>
            <Group justify="space-between" mt="sm">
              <Stack gap={2}>
                <Text size="sm">Visibilidad del poema</Text>
                <Text size="sm" c="dimmed">
                  {form.values.is_public ? "Público" : "Privado"}
                </Text>
              </Stack>
              <Group>
                <Switch
                  checked={form.values.is_public}
                  labelPosition="left"
                  size="md"
                  key={form.key("is_public")}
                  thumbIcon={
                    form.values.is_public ? (
                      <TbWorld
                        size={15}
                        color="var(--mantine-primary-color-filled)"
                      />
                    ) : (
                      <TbLock size={15} color="black" />
                    )
                  }
                  {...form.getInputProps("is_public")}
                />
              </Group>
            </Group>
            <Group justify="space-between" mt="sm">
              <Stack gap={2}>
                <Text size="sm">Nombre del autor</Text>
                <Text size="sm" c="dimmed">
                  {form.values.show_author ? "Autor" : "Anónimo"}
                </Text>
              </Stack>
              <Group>
                <Switch
                  checked={form.values.show_author}
                  labelPosition="left"
                  size="md"
                  key={form.key("show_author")}
                  thumbIcon={
                    form.values.show_author ? (
                      <TbUser
                        size={15}
                        color="var(--mantine-primary-color-filled)"
                      />
                    ) : (
                      <TbSpy size={15} color="black" />
                    )
                  }
                  {...form.getInputProps("show_author")}
                />
              </Group>
            </Group>
          </Stack>
          {currentUser?.is_superuser && (
            <>
              <NavLink
                mt="xl"
                label="Opciones de administrador"
                leftSection={
                  opened ? (
                    <TbChevronDown size={15} />
                  ) : (
                    <TbChevronRight size={15} />
                  )
                }
                active={opened}
                onClick={toggle}
              />
              <Collapse in={opened}>
                <Fieldset mt="md">
                  <Stack gap="xs">
                    <MultiSelect
                      searchable
                      name="author_names"
                      key={form.key("author_names")}
                      label="Autores"
                      placeholder="Escribe para buscar un autor"
                      data={author_names_info}
                      {...form.getInputProps("author_names")}
                    />
                    <Select
                      allowDeselect
                      searchable
                      nothingFoundMessage="No hay nada aquí..."
                      name="original_poem_id"
                      key={form.key("original_poem_id")}
                      label="Poema original"
                      placeholder="Escribe para buscar un poema"
                      data={Object.keys(poems_info) as any[]}
                      {...form.getInputProps("original_poem_id")}
                    />
                    <Select
                      allowDeselect
                      nothingFoundMessage="No hay nada aquí..."
                      checkIconPosition="right"
                      name="type"
                      key={form.key("type")}
                      label="Tipo de poema"
                      placeholder="Selecciona el tipo de poema"
                      data={typeData}
                      {...form.getInputProps("type")}
                    />
                  </Stack>
                </Fieldset>
              </Collapse>
            </>
          )}
          <Group justify="flex-end" mt="xl">
            <Button
              type="submit"
              w={150}
              loading={mutation.isPending}
              loaderProps={{ type: "dots" }}
            >
              Guardar
            </Button>
            <Button
              w={150}
              variant="outline"
              onClick={() => navigate(`/poems/${poem.id}`)}
            >
              Cancelar
            </Button>
          </Group>
        </Stack>
      </Form>
    </Container>
  );
}
