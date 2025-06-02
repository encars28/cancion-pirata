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
import { CollectionCreate } from "../../client";
import { collectionsCreateCollection } from "../../client";
import { callService, handleError, handleSuccess } from "../../utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { isNotEmpty } from "@mantine/form";
import { useForm } from "@mantine/form";
import { useNavigate } from "react-router";
import useAuth from "../../hooks/useAuth";

export function AddCollection() {
  const { data: poemsData } = usePoems({});
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const poems_info = Object.fromEntries(
    poemsData?.data?.map((poem) => [
      `${poem.title} ${
        poem.author_names && poem.author_names?.length > 0 ? " - " : ""
      } ${poem.author_names?.join(", ")}`,
      poem.id,
    ]) ?? []
  );

  const addCollectionMutation = useMutation({
    mutationFn: async (data: CollectionCreate) =>
      callService(collectionsCreateCollection, { body: data }),
    onSuccess: () => {
      notifications.clean();
      modals.closeAll();
      handleSuccess();
    },
    onError: (error) => {
      handleError(error as any);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["users", currentUser?.id] });
    },
  });

  const form = useForm<CollectionCreate>({
    mode: "controlled",
    initialValues: {
      name: "",
      description: "",
      is_public: true,
      poem_ids: [],
    },
    validate: {
      name: isNotEmpty("El nombre no puede estar vacío"),
    },
    enhanceGetInputProps: () => ({
      disabled: addCollectionMutation.isPending,
    }),
  });

  const handleSubmit = async (values: CollectionCreate) => {
    try {
      if (values.description === "") {
        values.description = undefined;
      }

      if (values.poem_ids && values.poem_ids?.length !== 0) {
        values.poem_ids = values.poem_ids.map(
          (poem) => poems_info[poem]
        );
      }

      const collection = await addCollectionMutation.mutateAsync(values);
      if (collection) {
        navigate(`/collections/${collection.id}`);
      } else {
        navigate(`/users/${currentUser?.id}`);
      }
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
          required
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
            loading={addCollectionMutation.isPending}
            loaderProps={{ type: "dots" }}
          >
            Crear
          </Button>
        </Group>
      </Stack>
    </Form>
  );
}
