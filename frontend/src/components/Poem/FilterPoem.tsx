import { Stack, Select, Space, TextInput, Button, ActionIcon } from "@mantine/core";
import { Form, UseFormReturnType } from "@mantine/form";
import { FilterInfoButton } from "../FilterInfoButton";
import { TbChevronDown, TbChevronUp } from "react-icons/tb";

export interface PoemFilters {
  order_by?: "Título" | "Fecha de publicación" | "Fecha de modificación";
  title?: string;
  created_at?: string;
  updated_at?: string;
  language?: string;
  desc?: boolean;
}

export function FilterPoem({ form, handleSubmit }: { form: UseFormReturnType<PoemFilters>, handleSubmit: (values: any) => void }) {
  const Icon = form.values.desc ? TbChevronUp : TbChevronDown ;

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Stack gap="sm" ta="left" mt="md">
        <Select
          withCheckIcon={false}
          rightSection={    
            <ActionIcon 
              variant="transparent" 
              size={30} 
              color="grey"
              onClick={() => form.setFieldValue("desc", !form.values.desc)}
            >
              <Icon />
            </ActionIcon>
          }
          rightSectionPointerEvents="all"
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
          onClick={() => form.reset()}
          type="submit"
        >
          Borrar filtros
        </Button>
      </Stack>
    </Form>
  )
}