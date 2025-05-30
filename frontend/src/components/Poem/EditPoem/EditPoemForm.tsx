import { Checkbox, Fieldset, Collapse, NavLink, Tabs, Input, Group, Stack, TextInput, Textarea, Grid, Button, Center, Space, MultiSelect, Select } from "@mantine/core";
import { PoemPublicWithAllTheInfo, PoemUpdate } from "../../../client/types.gen";
import { Form, isNotEmpty } from "@mantine/form";
import { useForm } from "@mantine/form";
import { poemsUpdatePoem } from "../../../client";
import { callService, handleError, handleSuccess, PoemType } from "../../../utils";
import { HttpValidationError } from "../../../client/types.gen";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuth from "../../../hooks/useAuth";
import { TbChevronRight } from "react-icons/tb";
import { useDisclosure } from "@mantine/hooks";
import useAuthors from "../../../hooks/useAuthors";
import usePoems from "../../../hooks/usePoems";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router";

export function EditPoemForm({ poem }: { poem: PoemPublicWithAllTheInfo}) {
  const [opened, { toggle }] = useDisclosure(false);
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (data: PoemUpdate) =>
      callService(poemsUpdatePoem, { path: { poem_id: poem.id }, body: data }),
    onSuccess: () => {
      notifications.clean()
      navigate(`/poems/${poem.id}`)
      handleSuccess()
    },

    onError: (error: HttpValidationError) => {
      handleError(error)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["poems"] })
      queryClient.invalidateQueries({ queryKey: ["authors"] })
    },
  })

  const form = useForm<PoemUpdate>({
    mode: 'uncontrolled',
    initialValues: {
      ...poem,
      original_poem_id: undefined,
      type: undefined,
    },
    validate: {
      title: isNotEmpty('El título no puede estar vacío'),
      content: isNotEmpty('El contenido no puede estar vacío')
    },
    enhanceGetInputProps: () => ({
      disabled: mutation.isPending,
    }),
  });

  const { data: authorsData } = useAuthors({})
  const { data: poemsData } = usePoems({})

  const author_names = authorsData?.data?.map(author => author.full_name) ?? []
  const poems_info = Object.fromEntries(poemsData?.data?.map((poem) => [`${poem.title} - ${poem.author_names?.join(", ")}`, poem.id]) ?? [])


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



  const handleSubmit = async () => {
    try {
      if (form.isDirty()) {
        const values = form.getValues()

        if (values.language === "") {
          values.language = undefined
        }

        if (values.type == -1) {
          values.type = undefined
        }

        if (values.original_poem_id !== undefined && values.original_poem_id !== null) {
          values.original_poem_id = poems_info[values.original_poem_id] ?? undefined
        }

        await mutation.mutateAsync(values)
        form.resetDirty()
      }
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
                name='title'
                key={form.key('title')}
                label="Título"
                placeholder="Tu título"
                {...form.getInputProps('title')}
              />
              <TextInput
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
                  defaultChecked={poem.is_public}
                  key={form.key('is_public')}
                  {...form.getInputProps('is_public')}
                  label="Poema público"
                />
                <Checkbox
                  defaultChecked={poem.show_author}
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
                  autosize
                  maxRows={15}
                  mt="lg"
                  name='content'
                  key={form.key('content')}
                  placeholder="Tu contenido"
                  {...form.getInputProps('content')}
                />
              </Tabs.Panel>
            </Tabs>
          </Grid.Col>
          {currentUser?.is_superuser && (
            <Grid.Col span={24}>
              <NavLink
                label="Opciones de administrador"
                rightSection={
                  <TbChevronRight size={12} className="mantine-rotate-rtl" />
                }
                active={opened}
                onClick={toggle}
              />
              <Collapse in={opened}>
                <Fieldset mt="md">
                  <Stack gap="xs">
                    <MultiSelect
                      searchable
                      name='author_names'
                      key={form.key('author_names')}
                      label="Autores"
                      placeholder="Escribe para buscar un autor"
                      data={author_names}
                      {...form.getInputProps('author_names')}
                    />
                    <Select
                      allowDeselect
                      searchable
                      nothingFoundMessage="No hay nada aquí..."
                      name='original_poem_id'
                      key={form.key('original_poem_id')}
                      label="Poema original"
                      placeholder="Escribe para buscar un poema"
                      data={Object.keys(poems_info) as any[]}
                      {...form.getInputProps('original_poem_id')}
                    />
                    <Select
                      allowDeselect
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
          )}
          <Grid.Col span={24} mt="xl">
            <Group justify="flex-end">
              <Button
                type="submit"
                w={150}
                loading={mutation.isPending}
                loaderProps={{ type: 'dots' }}
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
          </Grid.Col>
        </Grid>
      </Center>
    </Form >

  )
}