import { Stack, TextInput, Group, Button } from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import { TbCalendar } from "react-icons/tb";
import { AuthorUpdate, AuthorPublic } from "../../client/types.gen";
import useAuthorActions from "../../hooks/useAuthorActions";
import useAuth from "../../hooks/useAuth";

export function EditAuthor({ author }: { author: AuthorPublic }) {
  const { editAuthorMutation: mutation } = useAuthorActions(author.id);
  const { user: currentUser } = useAuth();

  const form = useForm<AuthorUpdate>({
    mode: "uncontrolled",
    initialValues: {
      ...author,
    },
    enhanceGetInputProps: () => ({
      disabled: mutation.isPending,
    }),
  });

  const handleSubmit = async () => {
    try {
      if (form.isDirty()) {
        const values = form.getValues();
        if (values.full_name === "") {
          values.full_name = undefined;
        }
        await mutation.mutateAsync(values);
        form.resetDirty();
      }
    } catch {
      // error is handled by mutation
      form.setErrors({ full_name: "Nombre repetido o incorrecto" });
    }
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Stack gap="lg" ta="left" m="md" pb="md">
        <TextInput
          name="full_name"
          label="Nombre completo"
          placeholder={author.full_name}
          {...form.getInputProps("full_name")}
          key={form.key("full_name")}
          readOnly={
            !(
              currentUser?.is_superuser === true ||
              currentUser?.author_id === author.id
            )
          }
        />
        <DateInput
          clearable
          name="birth_date"
          leftSection={<TbCalendar size={18} />}
          leftSectionPointerEvents="none"
          label="Fecha de nacimiento"
          placeholder="Fecha de nacimiento"
          valueFormat="DD/MM/YYYY"
          {...form.getInputProps("birth_date")}
          key={form.key("birth_date")}
          readOnly={
            !(
              currentUser?.is_superuser === true ||
              currentUser?.author_id === author.id
            )
          }
        />
        {(currentUser?.is_superuser === true ||
          currentUser?.author_id === author.id) && (
          <Group justify="flex-end" pt="lg">
            <Button
              variant="filled"
              type="submit"
              loading={mutation.isPending}
              loaderProps={{ type: "dots" }}
            >
              Guardar
            </Button>
          </Group>
        )}
      </Stack>
    </Form>
  );
}
