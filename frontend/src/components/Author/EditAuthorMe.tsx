import { Stack, Group, Button } from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import { TbCake } from "react-icons/tb";
import { AuthorPublic, AuthorUpdateBasic } from "../../client/types.gen";
import useUserMe from "../../hooks/useUserMe";

export function EditAuthorMe({ author }: { author: AuthorPublic }) {
  const { editAuthorMe: mutation } = useUserMe();

  const form = useForm<AuthorUpdateBasic>({
    mode: "uncontrolled",
    initialValues: {
      ...author,
    },
    enhanceGetInputProps: () => ({
      disabled: mutation.isPending,
    }),
  });

  const handleSubmit = async (values: AuthorUpdateBasic) => {
    try {
      if (form.isDirty()) {
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
      <Stack >
        <DateInput
          clearable
          name="birth_date"
          leftSection={<TbCake size={18} />}
          leftSectionPointerEvents="none"
          label="Fecha de nacimiento"
          placeholder="Fecha de nacimiento"
          valueFormat="DD/MM/YYYY"
          {...form.getInputProps("birth_date")}
          key={form.key("birth_date")}
        />
        <Group justify="flex-end" pt="lg">
          <Button
            variant="filled"
            type="submit"
            loading={mutation.isPending}
            loaderProps={{ type: "dots" }}
            fullWidth
          >
            Guardar
          </Button>
        </Group>
      </Stack>
    </Form>
  );
}
