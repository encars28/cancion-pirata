import { Shell } from "../components/Shell/Shell";
import { CardGrid, CardGridProps } from "../components/CardGrid";
import { Container, Avatar, Text, Title, Button, Grid, Paper, Select, TextInput, Stack, Space } from "@mantine/core";
import { handleError } from "../utils";
import { Loading } from "../components/Loading";
import { AuthorPublicWithPoems } from "../client";
import { TbFilter } from "react-icons/tb";
import { FilterInfoButton } from "../components/FilterInfoButton";
import { Form, useForm } from "@mantine/form";
import useAuthors, { QueryParams } from "../hooks/useAuthors";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthorFilters {
  order_by?: "Nombre" | "Año de nacimiento" | "Número de poemas";
  full_name?: string;
  birth_year?: string;
  poems?: string;
}

export function AuthorsPage() {
  const [filters, setFilters] = useState<QueryParams>({})
  const queryClient = useQueryClient()

  const form = useForm<AuthorFilters>({
    mode: "uncontrolled",
    initialValues: {
      order_by: "Nombre",
      full_name: "",
      birth_year: "",
      poems: "",
    }
  })

  const { data, error, isPending, isError } = useAuthors(filters)

  if (isPending) {
    return (<Loading />)
  }

  if (isError) {
    handleError(error as any);
  }

  const authors: AuthorPublicWithPoems[] = data?.data ?? []
  const authorCount: number = data?.count ?? 0

  const handleSubmit = async (values: typeof form.values) => {
    setFilters({
      order_by: values.order_by === "Año de nacimiento" ? "birth_date" : values.order_by === "Número de poemas" ? "poems" : "full_name",
      full_name: values.full_name,
      birth_year: values.birth_year,
      poems: values.poems,
    })
    console.log("Filters: ", filters)
    queryClient.invalidateQueries({ queryKey: ["authors", "filters"] })
  }

  const cardData: CardGridProps[] = authors.map((author) => ({
    path: `/authors/${author.id}`,
    icon: <Avatar name={author.full_name} key={author.full_name} color="initials" size="xl" />,
    description: <Text mt="md" size="sm">{author.full_name}</Text>
  }))

  return (
    <Shell>
      <Container mt={40}>
        <Title order={1}>Lista de autores</Title>
        <Title order={2} c="dimmed" fw="inherit">Total: {authorCount}</Title>
      </Container>
      <Grid columns={24}>
        <Grid.Col span={19}>
          <CardGrid data={cardData} />
        </Grid.Col>
        <Grid.Col span={5}>
          <Form form={form} onSubmit={handleSubmit}>
            <Paper shadow="xl" p="lg" mr="xl" h={500} withBorder>
              <Stack gap="sm" ta="left" mt="md">
                <Select
                  label="Ordenar por"
                  defaultValue="Nombre"
                  data={["Nombre", "Año de nacimiento", "Número de poemas"]}
                  allowDeselect={false}
                  radius="lg"
                  variant="filled"
                  key={form.key("order_by")}
                  {...form.getInputProps("order_by")}
                />
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
                  leftSection={<TbFilter />}
                  fullWidth
                  radius="lg"
                  type="submit"
                >
                  Ordenar y filtrar
                </Button>
              </Stack>
            </Paper>
          </Form>
        </Grid.Col>
      </Grid>
    </Shell>
  )
}