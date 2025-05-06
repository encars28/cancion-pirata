import { Stack, Select, Space, TextInput, Button } from "@mantine/core";
import { Form, UseFormReturnType } from "@mantine/form";
import { FilterInfoButton } from "../FilterInfoButton";

export interface AuthorFilters {
  order_by?: "Nombre" | "Año de nacimiento" | "Número de poemas";
  full_name?: string;
  birth_year?: string;
  poems?: string;
}

export function FilterAuthor({ form, handleSubmit }: { form: UseFormReturnType<AuthorFilters>, handleSubmit: (values: any) => void }) {
  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Stack gap="sm" ta="left" mt="md">
        <Select
          label="Ordenar por"
          defaultValue="Nombre"
          data={["Nombre", "Año de nacimiento", "Número de poemas"]}
          allowDeselect={false}
          radius="lg"
          variant="filled"
          key={form.key("order_by")}
          {...form.getInputProps("order_by")}
        />
        <Space h="md" />
        <TextInput
          label="Nombre"
          placeholder="Nombre"
          radius="md"
          styles={{ input: { color: "grey" } }}
          key={form.key("full_name")}
          {...form.getInputProps("full_name")}
        />
        <TextInput
          label={<>Año de nacimiento<FilterInfoButton /> </>}
          placeholder="Año de nacimiento"
          radius="md"
          styles={{ input: { color: "grey" } }}
          key={form.key("birth_year")}
          {...form.getInputProps("birth_year")}
        />
        <TextInput
          label={<>Número de poemas<FilterInfoButton /> </>}
          placeholder="Número de poemas"
          radius="md"
          styles={{ input: { color: "grey" } }}
          key={form.key("poems")}
          {...form.getInputProps("poems")}
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