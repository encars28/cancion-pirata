import { Stack, Select, Space, TextInput, Button } from "@mantine/core";
import { Form, UseFormReturnType } from "@mantine/form";
import { FilterInfoButton } from "../FilterInfoButton";

export interface PoemFilters {
  order_by?: "Título" | "Fecha de publicación" | "Fecha de modificación";
  title?: string;
  created_at?: string;
  updated_at?: string;
  language?: string;
}

export function FilterPoem({ form, handleSubmit }: { form: UseFormReturnType<PoemFilters>, handleSubmit: (values: any) => void }) {
  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Stack gap="sm" ta="left" mt="md">
        <Select
          label="Ordenar por"
          defaultValue="Título"
          data={["Título", "Fecha de publicación", "Fecha de modificación"]}
          allowDeselect={false}
          radius="lg"
          variant="filled"
          key={form.key("order_by")}
          {...form.getInputProps("order_by")}
        />
        <Space h="md" />
        <TextInput
          label="Título"
          placeholder="Título"
          radius="md"
          styles={{ input: { color: "grey" } }}
          key={form.key("title")}
          {...form.getInputProps("title")}
        />
        <TextInput
          label={<>Fecha de publicación<FilterInfoButton /> </>}
          placeholder="Fecha de publicación"
          radius="md"
          styles={{ input: { color: "grey" } }}
          key={form.key("created_at")}
          {...form.getInputProps("created_at")}
        />
        <TextInput
          label={<>Fecha de modificación<FilterInfoButton /> </>}
          placeholder="Fecha de publicación"
          radius="md"
          styles={{ input: { color: "grey" } }}
          key={form.key("updated_at")}
          {...form.getInputProps("updated_at")}
        />
        <TextInput
          label="Idioma"
          placeholder="Idioma"
          radius="md"
          styles={{ input: { color: "grey" } }}
          key={form.key("language")}
          {...form.getInputProps("langeuage")}
        />
        <Space h="md" />
        <Button
          variant="light"
          color="grey"
          fullWidth
          radius="lg"
          type="submit"
        >
          Filtrar
        </Button>        
        <Button
          variant="light"
          color="red"
          fullWidth
          radius="lg"
          onClick={() => {
            form.reset();
            handleSubmit(form.values);
          }
          }
        >
          Borrar filtros
        </Button>
      </Stack>
    </Form>
  )
}