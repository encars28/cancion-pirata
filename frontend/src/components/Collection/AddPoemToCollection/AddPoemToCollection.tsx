import { Radio, Button, Stack, Group, Text } from "@mantine/core";
import classes from "./AddPoemToCollection.module.css";
import { ScrollArea } from "@mantine/core";
import { modals } from "@mantine/modals";
import { isNotEmpty, Form, useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collectionsAddPoemToCollection } from "../../../client/";
import { callService } from "../../../utils";
import useAuth from "../../../hooks/useAuth";
import { notifications } from "@mantine/notifications";
import { successNotification } from "../../Notifications/notifications";

export function AddPoemToCollection({ poemId }: { poemId: string }) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const collections_info = Object.fromEntries(
    currentUser?.collections?.map((collection) => [
      collection.name,
      collection.id,
    ]) ?? []
  );

  const addPoemToCollection = useMutation({
    mutationFn: async ({
      poemId,
      collectionId,
    }: {
      poemId: string;
      collectionId: string;
    }) =>
      callService(collectionsAddPoemToCollection, {
        path: { collection_id: collectionId, poem_id: poemId },
      }),
    onSuccess: () => {
      notifications.show(successNotification({
        title: "Poema añadido a colección",
        description: "El poema ha sido añadido a la colección correctamente.",
      }));
      modals.closeAll();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });

  const form = useForm<{ collection_name: string }>({
    mode: "controlled",
    initialValues: {
      collection_name: "",
    },
    validate: {
      collection_name: isNotEmpty(
        "El nombre de la colección no puede estar vacío"
      ),
    },
  });

  const handleSubmit = async (values: { collection_name: string }) => {
    try {
      const collectionId = collections_info[values.collection_name];
      await addPoemToCollection.mutateAsync({ poemId: poemId!, collectionId });
    } catch {
      form.setErrors({
        collection_name:
          "Error al añadir el poema a la colección. Asegúrese de que la colección existe.",
      });
    }
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Stack p="lg">
        <Radio.Group
          label="Elige una colección"
          description="Elige la colección a la que añadir el poema"
          name="collection_name"
          {...form.getInputProps("collection_name")}
        >
          <ScrollArea.Autosize
            mah={250}
            offsetScrollbars
            type="always"
            scrollbars="y"
            mt="xs"
            mb="xs"
          >
            <Stack pt="md" gap="xs">
              {Object.keys(collections_info).map((item) => (
                <Radio.Card
                  className={classes.root}
                  radius="md"
                  value={item}
                  key={item}
                >
                  <Group wrap="nowrap" align="flex-start">
                    <Radio.Indicator color="green" />
                    <Text className={classes.label}>{item}</Text>
                  </Group>
                </Radio.Card>
              ))}
            </Stack>
          </ScrollArea.Autosize>
        </Radio.Group>

        <Button
          type="submit"
          fullWidth
          mt="md"
          color="green"
          loading={addPoemToCollection.isPending}
          loaderProps={{ type: "dots" }}
        >
          Añadir a colección
        </Button>
      </Stack>
    </Form>
  );
}
