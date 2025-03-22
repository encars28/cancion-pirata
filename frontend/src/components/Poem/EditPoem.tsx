import { PoemTextEditor } from "../PoemTextEditor";
import { Checkbox, Fieldset, Tabs, Input, Group, Stack, TextInput, Textarea, Grid, Button, Center, Space } from "@mantine/core";
import { PoemPublicWithAllTheInfo, PoemUpdate } from "../../client/types.gen";
import { Form } from "@mantine/form";
import { useForm } from "@mantine/form";
import { poemsUpdatePoem } from "../../client";
import { callService, handleError, handleSuccess } from "../../utils";
import { HttpValidationError } from "../../client/types.gen";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// import useAuth from "../../hooks/useAuth";

export function EditPoem({ poem, close }: { poem: PoemPublicWithAllTheInfo, close: () => void }) {
  const form = useForm<PoemUpdate>({
    mode: 'uncontrolled',
    initialValues: {
      ...poem,
      author_ids: [],
      original_poem_id: undefined,
    }
  });

  // const { user: currentUser } = useAuth()

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (data: PoemUpdate) => 
      callService(poemsUpdatePoem, { path: { poem_id: poem.id }, body: data }),
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
      if (values.title === "") {
        values.title = undefined
      }

      if (values.language === "") {
        values.language = undefined
      }

      if (values.content === "") {
        form.setErrors({ content: 'El contenido no puede estar vacío' })
        return
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
                  mt="lg"
                  name='content'
                  key={form.key('content')}
                  placeholder="Tu contenido"
                  {...form.getInputProps('content')}
                />
              </Tabs.Panel>
            </Tabs>
          </Grid.Col>
          {/* {currentUser?.is_superuser && (
            <Grid.Col span={24}>
              <Input.Label>Opciones administrador</Input.Label>
              <Fieldset>
                <Stack gap="xs">
                  <TextInput
                    name='author_id'
                    key={form.key('author_id')}
                    label="Author ID"
                    placeholder="3c450272-b7c2-478c-9ec6-5105e6db396d"
                    {...form.getInputProps('author_id')}
                  />
                </Stack>
              </Fieldset>
            </Grid.Col>
          )} */}
          <Grid.Col span={24} mt="xl">
            <Group justify="flex-end">
              <Button
                type="submit"
                w={150}
              >
                Guardar
              </Button>
              <Button
                onClick={close}
                w={150}
                variant="outline"
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