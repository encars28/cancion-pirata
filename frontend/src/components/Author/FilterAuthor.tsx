import { Stack, Flex, Select, Space, TextInput, Button, ActionIcon, Tooltip } from "@mantine/core";
import { Form, UseFormReturnType } from "@mantine/form";
import { FilterInfoButton } from "../FilterInfoButton";
import { TbChevronUp, TbChevronDown } from "react-icons/tb";

export interface AuthorFilters {
  order_by?: "Nombre" | "Año de nacimiento" | "Número de poemas";
  full_name?: string;
  birth_year?: string;
  poems?: string;
  desc?: boolean;
}

export function FilterAuthor({ form, handleSubmit }: { form: UseFormReturnType<AuthorFilters>, handleSubmit: (values: any) => void }) {
  const Icon = form.values.desc ? TbChevronUp : TbChevronDown;
  const label = form.values.desc ? "Ascendente" : "Descendente";

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Stack gap="sm" ta="left" mt="md">
      <Flex direction="row" gap="sm">
        <Select
          withCheckIcon={false}
          rightSection={<></>}
          rightSectionPointerEvents="all"
          label="Ordenar por"
          defaultValue="Nombre"
          data={["Nombre", "Año de nacimiento", "Número de poemas"]}
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
          onClick={() => form.reset()}
          type="submit"
        >
          Borrar filtros
        </Button>
      </Stack>
    </Form>
  )
}