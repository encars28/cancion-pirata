import {
  Stack,
  Button,
  PasswordInput,
  Title,
  Container,
  Paper,
  TextInput,
} from "@mantine/core";
import { hasLength, isEmail, useForm } from "@mantine/form";
import { Form } from "@mantine/form";
import { UpdateEmail, usersRequestUpdateEmailMe } from "../../client";
import { callService } from "../../utils";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { successNotification } from "../../notifications";
import { TbAt } from "react-icons/tb";

export function UpdateEmailForm() {
  const mutation = useMutation({
    mutationFn: async (data: UpdateEmail) => {
      await callService(usersRequestUpdateEmailMe, { body: data });
    },
    onSuccess: () => {
      notifications.clean();
      notifications.show(
        successNotification({
          title: "Correo de verificación enviado",
          description:
            "Por favor, revisa tu correo electrónico para verificar tu nueva dirección de correo",
        })
      );
    },
  });

  const form = useForm<UpdateEmail>({
    mode: "uncontrolled",
    validate: {
      current_password: hasLength(
        { min: 8 },
        "La contraseña debe tener al menos 8 caracteres"
      ),
      new_email: isEmail("Por favor, introduce un correo electrónico válido"),
    },
    initialValues: {
      new_email: "",
      current_password: "",
    },
    enhanceGetInputProps: () => ({
      disabled: mutation.isPending,
    }),
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (form.isDirty()) {
        await mutation.mutateAsync(values)
        form.resetDirty()
      }
    } catch {
      form.setErrors({ new_email: "Email o contraseña inválidos", current_password: "Email o contraseña inválidos" });
    }
  };

  return (
    <Container size={550} h="100%" style={{ alignContent: "center" }}>
      <Paper withBorder shadow="md" p="xl" radius="lg">
        <Title ta="center" mb="xl">
          Cambiar email
        </Title>
        <Form form={form} onSubmit={handleSubmit}>
          <Stack>
            <PasswordInput
              name="current_password"
              key={form.key("current_password")}
              label="Contraseña"
              placeholder="Tu contraseña"
              {...form.getInputProps("current_password")}
              required
            />
            <TextInput
              name="new_email"
              key={form.key("new_email")}
              label="Nuevo email"
              leftSection={<TbAt />}
              placeholder="Tu nuevo email"
              {...form.getInputProps("new_email")}
              required
            />
            <Button
              type="submit"
              mt="md"
              loading={mutation.isPending}
              loaderProps={{ type: "dots" }}
            >
              Cambiar email
            </Button>
          </Stack>
        </Form>
      </Paper>
    </Container>
  );
}
