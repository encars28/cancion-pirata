import { PoemTextEditor } from "../PoemTextEditor";
import { Checkbox, Fieldset, Group, Flex, Container, Input, Stack, TextInput } from "@mantine/core";
import { PoemPublicWithAllTheInfo, PoemUpdate } from "../../client/types.gen";
import { Form } from "@mantine/form";
import { useForm } from "@mantine/form";

export function EditPoem({ poem }: { poem: PoemPublicWithAllTheInfo }) {
  const form = useForm<PoemUpdate>({
    initialValues: {
      ...poem
    }
  });

  return (
    <Form form={form}>
      <Flex
        justify="center"
        wrap="wrap"
      >
        <Flex 
          m="xl"
          ml={{ base: 50, sm: "xl" }}
          justify="flex-start"
          align="flex-start"
          w={{ base: "100%", sm: 200 }}
        >
          <Fieldset
            legend="Visibilidad"
            pt="lg"
            pl="xl"
            pr="xl"
            pb="lg"
            radius="lg"
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
        </Flex>
        <Container
          ta="left"
          m="xl"
          w={{base: "100%", sm: 400, md: 600, lg: 700, xl: 800}}
        >
        <Stack
          gap="xl"
        >
          <TextInput
            name='title'
            key={form.key('title')}
            label="Título"
            placeholder="Tu título"
            {...form.getInputProps('title')}
          />
          <Input.Wrapper label="Contentido">
            <Input
              component={PoemTextEditor}
              content={poem.content}
              key={form.key('content')}
              {...form.getInputProps('content')}
            />
          </Input.Wrapper>
        </Stack>
        </Container>
      </Flex>
    </Form >

  )
}