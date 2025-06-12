import {
  Checkbox,
  Fieldset,
  Collapse,
  NavLink,
  Tabs,
  Input,
  Group,
  Stack,
  TextInput,
  Textarea,
  Grid,
  Button,
  Center,
  Space,
  MultiSelect,
  Select,
  Container,
  Switch,
  Text,
} from "@mantine/core";
import {
  AuthorPublicBasic,
  PoemCreate,
  PoemPublicBasic,
} from "../../client/types.gen";
import { Form, isNotEmpty } from "@mantine/form";
import { useForm } from "@mantine/form";
import { poemsCreatePoem } from "../../client";
import { callService, showError, showSuccess, PoemType } from "../../utils";
import { HttpValidationError } from "../../client/types.gen";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuth from "../../hooks/useAuth";
// import useAuthors from "../../hooks/useAuthors";
// import usePoems from "../../hooks/usePoems";
import {
  TbChevronDown,
  TbChevronRight,
  TbLock,
  TbSpy,
  TbSpyOff,
  TbUser,
  TbWorld,
} from "react-icons/tb";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router";
import { notifications } from "@mantine/notifications";
import useSearch from "../../hooks/useSearch";
import { LanguageHelp } from "../LanguageHelp/LanguageHelp";
import { PoemHelp } from "./PoemHelp";

export function AddPoem() {
  const [opened, { toggle }] = useDisclosure(false);
  const [adminOpened, { toggle: adminToggle }] = useDisclosure(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: PoemCreate) =>
      callService(poemsCreatePoem, { body: data }),
    onSuccess: () => {
      notifications.clean();
      showSuccess();
      navigate(`/authors/${user?.author_id}`);
    },

    onError: (error: HttpValidationError) => {
      showError(error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["poems"] });
      queryClient.invalidateQueries({ queryKey: ["authors"] });
    },
  });

  const form = useForm<PoemCreate>({
    mode: "controlled",
    initialValues: {
      title: "",
      content: "",
      language: "",
      is_public: true,
      show_author: true,
      author_names: [],
      original_poem_id: undefined,
      type: undefined,
    },
    validate: {
      title: isNotEmpty("El título no puede estar vacío"),
      content: isNotEmpty("El contenido no puede estar vacío"),
    },
    enhanceGetInputProps: () => ({
      disabled: mutation.isPending,
    }),
  });

  const { data: searchData } = useSearch({ search_type: ["poem", "author"] });
  const authorsData = searchData?.authors as AuthorPublicBasic[];
  const poemsData = searchData?.poems as PoemPublicBasic[];

  const author_names = authorsData?.map((author) => author.full_name) ?? [];
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
    } catch {
      // error is handled by mutation
    }
  };

  return (
    <Container>
      <Form form={form} onSubmit={handleSubmit}>
        <Stack gap="xs">
          <TextInput
            required
            name="title"
            label="Título"
            placeholder="Tu título"
            key={form.key("title")}
            {...form.getInputProps("title")}
          />

          {/* <Tabs variant="outline" defaultValue="editor">
              <Tabs.List>
                {/* <Tabs.Tab value="richEditor">
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
              resize="vertical"
              w="100%"
              required
              autosize
              maxRows={15}
              mt="xs"
              label="Contenido"
              name="content"
              placeholder="Tu contenido"
              key={form.key("content")}
              {...form.getInputProps("content")}
            />
            <PoemHelp />

          {/* </Tabs.Panel>
            </Tabs> */}
          <Stack mt="sm" gap={5}>
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
          <NavLink
            mt="xl"
            label="Opciones avanzadas"
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
                <TextInput
                  name="language"
                  label="Idioma"
                  placeholder="es"
                  key={form.key("language")}
                  {...form.getInputProps("language")}
                />
                <Select
                  allowDeselect
                  searchable
                  nothingFoundMessage="No hay nada aquí..."
                  name="original_poem_id"
                  label="Poema original"
                  placeholder="Escribe para buscar un poema"
                  data={Object.keys(poems_info) as any[]}
                  key={form.key("original_poem_id")}
                  {...form.getInputProps("original_poem_id")}
                />
                <Select
                  allowDeselect
                  nothingFoundMessage="No hay nada aquí..."
                  checkIconPosition="right"
                  name="type"
                  label="Tipo de poema"
                  placeholder="Selecciona el tipo de poema"
                  data={typeData}
                  key={form.key("type")}
                  {...form.getInputProps("type")}
                />
              </Stack>
            </Fieldset>
          </Collapse>

          {currentUser?.is_superuser && (
            <>
              <NavLink
                label="Opciones de administrador"
                leftSection={
                  opened ? (
                    <TbChevronDown size={15} />
                  ) : (
                    <TbChevronRight size={15} />
                  )
                }
                active={adminOpened}
                onClick={adminToggle}
              />
              <Collapse in={adminOpened}>
                <Fieldset mt="md">
                  <Stack gap="xs">
                    <MultiSelect
                      searchable
                      name="author_names"
                      label="Autores"
                      placeholder="Escribe para buscar un autor"
                      data={author_names}
                      key={form.key("author_names")}
                      {...form.getInputProps("author_names")}
                    />
                  </Stack>
                </Fieldset>
              </Collapse>
            </>
          )}
          <Group justify="flex-end">
            <Button
              type="submit"
              w={150}
              loaderProps={{ type: "dots" }}
              loading={mutation.isPending}
              mt="xl"
            >
              Guardar
            </Button>
          </Group>
        </Stack>
      </Form>
    </Container>
  );
}
