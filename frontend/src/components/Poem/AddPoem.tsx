import { Checkbox, Fieldset, Collapse, NavLink, Tabs, Input, Group, Stack, TextInput, Textarea, Grid, Button, Center, Space, MultiSelect, Select } from "@mantine/core";
import { PoemCreate } from "../../client/types.gen";
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
import { useNavigate } from "react-router";
import { notifications } from "@mantine/notifications";

enum PoemType {
  TRANSLATION = 0,
  VERSION = 1,
}

export function AddPoem() {
  const [opened, { toggle }] = useDisclosure(false);
  const [adminOpened, { toggle: adminToggle }] = useDisclosure(false);
  const navigate = useNavigate()
  const { user} = useAuth()

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (data: PoemCreate) =>
      callService(poemsCreatePoem, { body: data }),
    onSuccess: () => {
      notifications.clean()
      handleSuccess()
      navigate(`/authors/${user?.author_id}`)
    },

    onError: (error: HttpValidationError) => {
      handleError(error)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["poems"] })
      queryClient.invalidateQueries({ queryKey: ["authors"] })
    },
  })

  const form = useForm<PoemCreate>({
    mode: 'uncontrolled',
    initialValues: {
      title: '',
      content: '',
      language: '',
      is_public: true,
      show_author: true,
      author_names: [],
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

  const author_names = authorsData?.data.map(author => author.full_name) ?? []
  const poems_ids = poemsData?.data.map(poem => poem.id) ?? []


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
                name='title'
                label="Título"
                placeholder="Tu título"
                key={form.key('title')}
                {...form.getInputProps('title')}
              />
              <TextInput
                name='language'
                label="Idioma"
                placeholder="es"
                key={form.key('language')}
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
                  key={form.key('is_public')}
                  {...form.getInputProps('is_public')}
                  label="Poema público"
                />
                <Checkbox
                  defaultChecked
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
                  autosize
                  maxRows={15}
                  mt="lg"
                  name='content'
                  placeholder="Tu contenido"
                  key={form.key('content')}
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
                    nothingFoundMessage="No hay nada aquí..."
                    name='original_poem_id'
                    label="Poema original"
                    placeholder="Escribe para buscar un poema"
                    data={poems_ids}
                    key={form.key('original_poem_id')}
                    {...form.getInputProps('original_poem_id')}
                  />
                  <Select
                    allowDeselect
                    nothingFoundMessage="No hay nada aquí..."
                    checkIconPosition="right"
                    name='type'
                    label="Tipo de poema"
                    placeholder="Selecciona el tipo de poema"
                    data={typeData}
                    key={form.key('type')}
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
                      name='author_names'
                      label="Autores"
                      placeholder="Escribe para buscar un autor"
                      data={author_names}
                      key={form.key('author_names')}
                      {...form.getInputProps('author_names')}
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