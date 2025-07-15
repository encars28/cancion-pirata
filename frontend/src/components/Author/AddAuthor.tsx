import {
  Stack,
  TextInput,
  Paper,
  Container,
  Group,
  Button,
  Title,
} from "@mantine/core";
import { Form, isNotEmpty, useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import { TbCalendar } from "react-icons/tb";
import { AuthorCreate } from "../../client/types.gen";
import { callService } from "../../utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authorsCreateAuthor } from "../../client";
import { notifications } from "@mantine/notifications";
import { successNotification } from "../../notifications";

export function AddAuthor() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: AuthorCreate) =>
      callService(authorsCreateAuthor, { body: data }),
    onSuccess: () => {
      notifications.clean();
      notifications.show(
        successNotification({
          title: "Autor creado",
          description: "El autor ha sido creado correctamente.",
        })
      );
      close();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] });
    },
  });

  const form = useForm<AuthorCreate>({
    mode: "uncontrolled",
    initialValues: {
      full_name: "",
      birth_date: null,
      death_date: null,
    },
    validate: {
      full_name: isNotEmpty("El nombre es requerido"),
    },
    enhanceGetInputProps: () => ({
      disabled: mutation.isPending,
    }),
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await mutation.mutateAsync(values);
    } catch {
      // error is handled by mutation
      form.setErrors({ full_name: "Nombre repetido o incorrecto" });
    }
  };

  return (
    <Container size={500}>
      <Paper withBorder p="lg" radius="md">
        <Stack>
          <Title order={2} ta="center" mb="sm" mt="sm">
            Añadir autor
          </Title>
          <Form form={form} onSubmit={handleSubmit}>
            <Stack gap="lg" m="md" pb="md">
              <TextInput
                name="full_name"
                label="Nombre completo"
                placeholder="Nombre completo"
                {...form.getInputProps("full_name")}
                key={form.key("full_name")}
                required
              />
              <DateInput
                clearable
                name="birth_date"
                leftSection={<TbCalendar size={18} />}
                leftSectionPointerEvents="none"
                label="Fecha de nacimiento"
                placeholder="Fecha de nacimiento"
                valueFormat="DD/MM/YYYY"
                key={form.key("birth_date")}
                {...form.getInputProps("birth_date")}
              />
              <DateInput
                clearable
                name="death_date"
                leftSection={<TbCalendar size={18} />}
                leftSectionPointerEvents="none"
                label="Fecha de fallecimiento"
                placeholder="Fecha de fallecimiento"
                valueFormat="DD/MM/YYYY"
                key={form.key("death_date")}
                {...form.getInputProps("death_date")}
              />
              <Group justify="flex-end" pt="lg">
                <Button
                  fullWidth
                  variant="filled"
                  type="submit"
                  loading={mutation.isPending}
                  loaderProps={{ type: "dots" }}
                >
                  Guardar
                </Button>
              </Group>
            </Stack>
          </Form>
        </Stack>
      </Paper>
    </Container>
  );
}
