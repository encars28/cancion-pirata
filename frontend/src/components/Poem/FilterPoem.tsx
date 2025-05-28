import { Stack, Select, Space, TextInput, Button, ActionIcon, Flex, Tooltip } from "@mantine/core";
import { Form, UseFormReturnType } from "@mantine/form";
import { FilterInfoButton } from "../FilterInfoButton";
import { TbArrowsSort, TbChevronDown, TbChevronUp } from "react-icons/tb";

export interface PoemFilters {
  order_by?: "Título" | "Fecha de publicación" | "Fecha de modificación";
  title?: string;
  created_at?: string;
  updated_at?: string;
  language?: string;
  verses?: string;
  type?: "Todos" | "Versión" | "Traducción" | "Original" | "Derivado";
  desc?: boolean;
}

export function FilterPoem({ form, handleSubmit }: { form: UseFormReturnType<PoemFilters>, handleSubmit: (values: any) => void }) {
  const Icon = form.values.desc ? TbChevronUp : TbChevronDown;
  const label = form.values.desc ? "Ascendente" : "Descendente";

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Stack gap="sm" ta="left" mt="md">
        <Flex direction="row" gap="sm">
          <Select
            withCheckIcon={false}
            rightSection={<></>}
            label="Ordenar por"
            defaultValue="Título"
            data={["Título", "Fecha de publicación", "Fecha de modificación"]}
            allowDeselect={false}
            radius="lg"
            variant="filled"
            key={form.key("order_by")}
            {...form.getInputProps("order_by")}
          />
        <Tooltip label={label}>
          <ActionIcon
            variant="light"
            radius="lg"
            mt={28}
            size={30}
            color="grey"
            onClick={() => form.setFieldValue("desc", !form.values.desc)}
          >
            <Icon />
          </ActionIcon>
        </Tooltip>
        </Flex>
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
          label={<>Número de versos<FilterInfoButton /> </>}
          placeholder="Número de versos"
          radius="md"
          styles={{ input: { color: "grey" } }}
          key={form.key("verses")}
          {...form.getInputProps("verses")}
        />
        <TextInput
          label="Idioma"
          placeholder="Idioma"
          radius="md"
          styles={{ input: { color: "grey" } }}
          key={form.key("language")}
          {...form.getInputProps("langeuage")}
        />
        <Space h="sm" />
        <Select
          label="Tipo"
          placeholder="Todos"
          data={["Todos", "Versión", "Traducción", "Original", "Derivado"]}
          radius="md"
          styles={{ input: { color: "grey" } }}
          key={form.key("type")}
          {...form.getInputProps("type")}
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
          onClick={() => form.reset()}
          type="submit"
        >
          Borrar filtros
        </Button>
      </Stack>
    </Form>
  )
}