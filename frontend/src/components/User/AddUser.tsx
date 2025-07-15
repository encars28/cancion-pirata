import {
  Stack,
  TextInput,
  PasswordInput,
  Title,
  Group,
  Button,
  Switch,
  Text,
  Container,
  Paper,
} from "@mantine/core";
import { Form, hasLength, isEmail, isNotEmpty, useForm } from "@mantine/form";
import { TbUser, TbAt, TbAbc, TbCrown, TbLockCheck, TbX } from "react-icons/tb";
import { UserCreate } from "../../client/types.gen";
import { callService } from "../../utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersCreateUser } from "../../client";
import { notifications } from "@mantine/notifications";
import { successNotification } from "../../notifications";

export function AddUser() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: UserCreate) =>
      callService(usersCreateUser, { body: data }),
    onSuccess: () => {
      notifications.clean();
      notifications.show(
        successNotification({
          title: "Usuario creado",
          description: "El usuario se ha creado correctamente",
        })
      );
      close();
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const form = useForm<UserCreate>({
    mode: "controlled",
    initialValues: {
      email: "",
      password: "",
      username: "",
      full_name: "",
      is_superuser: false,
    },
    validate: {
      email: isEmail("Correo electrónico inválido"),
      password: hasLength(
        { min: 8 },
        "La contraseña debe tener al menos 8 caracteres"
      ),
      username: isNotEmpty("Nombre de usuario requerido"),
    },
    enhanceGetInputProps: () => ({
      disabled: mutation.isPending,
    }),
  });

  const handleSubmit = async () => {
    try {
      const values = form.getValues();
      if (values.full_name === "") {
        values.full_name = undefined;
      }

      await mutation.mutateAsync(values);
    } catch {
      // error is handled by mutation
      form.setErrors({
        email: "Correo o usuario incorrecto",
        username: "Correo o usuario incorrecto",
      });
    }
  };

  return (
    <Container size={500}>
      <Paper withBorder p="lg" radius="md">
        <Stack>
          <Title order={2} ta="center" mb="sm" mt="sm">
            Añadir usuario
          </Title>
          <Form form={form} onSubmit={handleSubmit}>
            <Stack gap="lg" m="md" p="sm">
              <TextInput
                name="email"
                key={form.key("email")}
                label="Email"
                placeholder="ejemplo@ejemplo.com"
                leftSectionPointerEvents="none"
                leftSection={<TbAt size={15} />}
                {...form.getInputProps("email")}
                required
              />
              <PasswordInput
                name="password"
                key={form.key("password")}
                label="Contraseña"
                placeholder="Tu contraseña"
                {...form.getInputProps("password")}
                required
              />
              <TextInput
                name="username"
                key={form.key("username")}
                label="Nombre de usuario"
                placeholder="Tu nombre de usuario"
                leftSectionPointerEvents="none"
                leftSection={<TbUser size={15} />}
                {...form.getInputProps("username")}
                required
              />
              <TextInput
                name="full_name"
                key={form.key("full_name")}
                label="Nombre completo"
                placeholder="Nombre completo"
                leftSectionPointerEvents="none"
                leftSection={<TbAbc size={15} />}
                {...form.getInputProps("full_name")}
              />
              <Group justify="space-between" mt="sm">
                <Stack gap={2}>
                  <Text size="sm">Estado de la cuenta</Text>
                  <Text size="sm" c="dimmed">
                    {form.values.is_verified ? "Verificada" : "No verificada"}
                  </Text>
                </Stack>
                <Group>
                  <Switch
                    checked={form.values.is_verified}
                    labelPosition="left"
                    size="md"
                    key={form.key("is_verified")}
                    thumbIcon={
                      form.values.is_verified ? (
                        <TbLockCheck
                          size={15}
                          color="var(--mantine-primary-color-filled)"
                        />
                      ) : (
                        <TbX size={15} color="black" />
                      )
                    }
                    {...form.getInputProps("is_verified")}
                  />
                </Group>
              </Group>
              <Group justify="space-between" mt="sm">
                <Stack gap={2}>
                  <Text size="sm">Tipo de usuario</Text>
                  <Text size="sm" c="dimmed">
                    {form.values.is_superuser
                      ? "Administrador"
                      : "Usuario normal"}
                  </Text>
                </Stack>
                <Group>
                  <Switch
                    checked={form.values.is_superuser}
                    labelPosition="left"
                    size="md"
                    key={form.key("is_superuser")}
                    thumbIcon={
                      form.values.is_superuser ? (
                        <TbCrown
                          size={15}
                          color="var(--mantine-primary-color-filled)"
                        />
                      ) : (
                        <TbUser size={15} color="black" />
                      )
                    }
                    {...form.getInputProps("is_superuser")}
                  />
                </Group>
              </Group>
              <Group justify="flex-end" pt="lg">
                <Button
                  variant="filled"
                  type="submit"
                  fullWidth
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
