import {
  Button,
  Text,
  Group,
  MultiSelect,
  Stack,
  Textarea,
  TextInput,
  Switch,
} from "@mantine/core";
import { Form } from "@mantine/form";
import usePoems from "../../hooks/usePoems";
import { modals } from "@mantine/modals";
import { TbLock, TbWorld } from "react-icons/tb";
import { CollectionCreate, CollectionPublic } from "../../client";
import { isNotEmpty } from "@mantine/form";
import { useForm } from "@mantine/form";
import useCollectionActions from "../../hooks/useCollectionActions";

export function EditCollection({
  collection,
}: {
  collection: CollectionPublic;
}) {
  const { data: poemsData } = usePoems({});

  const poems_info = Object.fromEntries(
    poemsData?.data?.map((poem) => [
      `${poem.title} ${
        poem.author_names && poem.author_names?.length > 0 ? " - " : ""
      } ${poem.author_names?.join(", ")}`,
      poem.id,
    ]) ?? []
  );

  const initialPoems = Object.fromEntries(
    Object.entries(poems_info)
      .filter(([_, value]) => collection.poem_ids?.includes(value))
      .map(([key, value]) => [key, value])
  );

  const { editCollectionMutation } = useCollectionActions(collection.id!);

  const form = useForm<CollectionCreate>({
    mode: "controlled",
    initialValues: {
      ...collection,
      poem_ids: Object.keys(initialPoems),
    },
    validate: {
      name: isNotEmpty("El nombre no puede estar vacío"),
    },
    enhanceGetInputProps: () => ({
      disabled: editCollectionMutation.isPending,
    }),
  });

  const handleSubmit = async (values: CollectionCreate) => {
    try {
      if (values.description === "") {
        values.description = undefined;
      }

      if (values.poem_ids && values.poem_ids?.length !== 0) {
        values.poem_ids = values.poem_ids.map((poem) => poems_info[poem]);
      }

      await editCollectionMutation.mutateAsync(values);
      modals.closeAll();
    } catch {}
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Stack gap="lg" p="lg" ta="left">
        <TextInput
          label="Nombre de la colección"
          placeholder="Mi colección"
          {...form.getInputProps("name")}
          key={form.key("name")}
          name="name"
        />
        <Textarea
          label="Descripción"
          placeholder="Una breve descripción de la colección"
          {...form.getInputProps("description")}
          key={form.key("description")}
          name="description"
          autosize
          maxRows={4}
        />
        <MultiSelect
          data={Object.keys(poems_info)}
          label="Poemas"
          ta="left"
          placeholder="Seleccione uno o más poemas"
          searchable
          nothingFoundMessage="No se encontraron poemas"
          key={form.key("poem_ids")}
          clearable
          withCheckIcon={false}
          limit={10}
          {...form.getInputProps("poem_ids")}
        />
        <Group justify="space-between" mt="sm">
          <Stack gap={2}>
            <Text size="sm">Visibilidad de la colección</Text>
            <Text size="sm" c="dimmed">
              {form.values.is_public ? "Pública" : "Privada"}
            </Text>
          </Stack>
          <Group>
            <Switch
              checked={form.values.is_public}
              labelPosition="left"
              size="md"
              key={form.key("is_public")}
              thumbIcon={
                form.values.is_public ? (
                  <TbWorld
                    size={15}
                    color="var(--mantine-primary-color-filled)"
                  />
                ) : (
                  <TbLock size={15} color="black" />
                )
              }
              {...form.getInputProps("is_public")}
            />
          </Group>
        </Group>

        <Group mt="xl" justify="space-between">
          <Button variant="outline" onClick={() => modals.closeAll()} w="47%">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="filled"
            w="47%"
            loaderProps={{ type: "dots" }}
            loading={editCollectionMutation.isPending}
          >
            Editar
          </Button>
        </Group>
      </Stack>
    </Form>
  );
}
