import { Checkbox, Fieldset, Collapse, NavLink, Tabs, Input, Group, Stack, TextInput, Textarea, Grid, Button, Center, Space, MultiSelect, Select } from "@mantine/core";
import { AuthorPublicWithPoems, PoemCreate, PoemPublicWithAllTheInfo } from "../../client/types.gen";
import { Form, isNotEmpty } from "@mantine/form";
import { useForm } from "@mantine/form";
import { poemsCreatePoem } from "../../client";
import { callService, handleError, handleSuccess } from "../../utils";
import { HttpValidationError } from "../../client/types.gen";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuth from "../../hooks/useAuth";
import useAuthors  from "../../hooks/useAuthors";
import usePoems from "../../hooks/usePoems";
import { TbChevronRight } from "react-icons/tb";
import { useDisclosure } from "@mantine/hooks";

enum PoemType {
  TRANSLATION = 0,
  VERSION = 1,
}

export function AddPoem() {
  const [opened, { toggle }] = useDisclosure(false);
  const [adminOpened, { toggle: adminToggle }] = useDisclosure(false);

  const form = useForm<PoemCreate>({
    mode: 'uncontrolled',
    initialValues: {
      title: '',
      content: '',
      language: '',
      is_public: true,
      show_author: true,
      author_ids: [],
      original_poem_id: undefined,
      type: undefined,
    },
    validate: {
      title: isNotEmpty('El título no puede estar vacío'),
      content: isNotEmpty('El contenido no puede estar vacío')
    }
  });

  const { data: authorsData } = useAuthors()
  const { data: poemsData } = usePoems()

  const authors: AuthorPublicWithPoems[] = authorsData?.data ?? []
  const poems: PoemPublicWithAllTheInfo[] = poemsData?.data ?? []

  const author_ids = authors.map(author => author.id) ?? []
  const poems_ids = poems.map(poem => poem.id) ?? []

  // TODO: put this with author_names when the end point is created

  const typeData = [
    {
      value: PoemType.TRANSLATION + "",
      label: "Traducción"
    },
    {
      value: PoemType.VERSION + "",
      label: "Versión"
    },
    {
      value: -1 + "",
      label: "Original"
    }
  ]
  const { user: currentUser } = useAuth()

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (data: PoemCreate) =>
      callService(poemsCreatePoem, { body: data }),
    onSuccess: () => {
      handleSuccess()
      close()
    },

    onError: (error: HttpValidationError) => {
      handleError(error)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["poems"] })
    },
  })

  const handleSubmit = async () => {
    try {
      const values = form.getValues()

      if (values.language === "") {
        values.language = undefined
      }

      if (values.type == -1) {
        values.type = undefined
      }

      await mutation.mutateAsync(values)
    } catch {
      // error is handled by mutation
    }
  }

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Center
        w="100%"
        mt="xl"
        mb="xl"
      >
        <Grid
          ml={{ base: "xl", md: 80 }}
          mr={{ base: "xl", md: 80 }}
          mt="xl"
          gutter="lg"
          columns={24}
          ta="left"
          w={900}
        >
          <Grid.Col span={{ base: 24, sm: 17 }}>
            <Stack gap="xs">
              <TextInput
                required
                disabled={mutation.isPending}
                name='title'
                key={form.key('title')}
                label="Título"
                placeholder="Tu título"
                {...form.getInputProps('title')}
              />
              <TextInput
                disabled={mutation.isPending}
                name='language'
                key={form.key('language')}
                label="Idioma"
                placeholder="es"
                {...form.getInputProps('language')}
              />
            </Stack>

          </Grid.Col>
          <Grid.Col span={{ base: 24, sm: 7 }}>
            <Input.Label>Visibilidad</Input.Label>
            <Fieldset
              p="lg"
            >
              <Stack>
                <Checkbox
                  defaultChecked
                  disabled={mutation.isPending}
                  key={form.key('is_public')}
                  {...form.getInputProps('is_public')}
                  label="Poema público"
                />
                <Checkbox
                  defaultChecked
                  disabled={mutation.isPending}
                  key={form.key('show_author')}
                  {...form.getInputProps('show_author')}
                  label="Mostrar autor"
                />
              </Stack>
            </Fieldset>
          </Grid.Col>
          <Grid.Col span={24}>
            <Space h="md" />
            <Tabs variant="outline" defaultValue="editor">
              <Tabs.List>
                {/* <Tabs.Tab value="richEditor">
                  Editor de texto
                </Tabs.Tab> */}
                <Tabs.Tab value="editor">
                  Editor de lenguaje de marcado
                </Tabs.Tab>
              </Tabs.List>
              {/* <Tabs.Panel value="richEditor">
                <Input
                  mt="lg"
                  component={PoemTextEditor}
                  content={poem.content}
                  key={form.key('content')}
                  {...form.getInputProps('content')}
                />
              </Tabs.Panel> */}
              <Tabs.Panel value="editor">
                <Textarea
                  required
                  disabled={mutation.isPending}
                  mt="lg"
                  name='content'
                  key={form.key('content')}
                  placeholder="Tu contenido"
                  {...form.getInputProps('content')}
                />
              </Tabs.Panel>
            </Tabs>
          </Grid.Col>
          <Grid.Col span={24}>
            <NavLink
              label="Opciones avanzadas"
              rightSection={
                <TbChevronRight size={12} className="mantine-rotate-rtl" />
              }
              active={opened}
              onClick={toggle}
            />
            <Collapse in={opened}>
              <Fieldset mt="md">
                <Stack gap="xs">
                  <Select
                    allowDeselect
                    searchable
                    disabled={mutation.isPending}
                    nothingFoundMessage="No hay nada aquí..."
                    name='original_poem_id'
                    key={form.key('original_poem_id')}
                    label="Poema original"
                    placeholder="Escribe para buscar un poema"
                    data={poems_ids}
                    {...form.getInputProps('original_poem_id')}
                  />
                  <Select
                    allowDeselect
                    disabled={mutation.isPending}
                    nothingFoundMessage="No hay nada aquí..."
                    checkIconPosition="right"
                    name='type'
                    key={form.key('type')}
                    label="Tipo de poema"
                    placeholder="Selecciona el tipo de poema"
                    data={typeData}
                    {...form.getInputProps('type')}
                  />
                </Stack>
              </Fieldset>
            </Collapse>
          </Grid.Col>

          {currentUser?.is_superuser && (
            <Grid.Col span={24}>
              <NavLink
                label="Opciones de administrador"
                rightSection={
                  <TbChevronRight size={12} className="mantine-rotate-rtl" />
                }
                active={adminOpened}
                onClick={adminToggle}
              />
              <Collapse in={adminOpened}>
                <Fieldset mt="md">
                  <Stack gap="xs">
                    <MultiSelect
                      searchable
                      disabled={mutation.isPending}
                      name='author_ids'
                      key={form.key('author_ids')}
                      label="Autores"
                      placeholder="Escribe para buscar un autor"
                      data={author_ids}
                      {...form.getInputProps('author_ids')}
                    />
                  </Stack>
                </Fieldset>
              </Collapse>
            </Grid.Col>
          )}
          <Grid.Col span={24} mt="xl">
            <Group justify="flex-end">
              <Button
                type="submit"
                w={150}
                loaderProps={{ type: 'dots' }}
                loading={mutation.isPending}
              >
                Guardar
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Center>
    </Form >

  )
}