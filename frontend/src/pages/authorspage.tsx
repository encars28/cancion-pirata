import { Shell } from "../components/Shell/Shell";
import { Container, Paper, Drawer, Button, Group, Title, Flex } from "@mantine/core";
import { useForm } from "@mantine/form";
import { AuthorQueryParams } from "../hooks/useAuthors";
import { useQueryClient } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import { FilterAuthor, AuthorFilters } from "../components/Author/FilterAuthor";
import { TbFilter } from "react-icons/tb";
import React, { useEffect } from "react"
import { AuthorGrid } from "../components/Grid/AuthorGrid";

export function AuthorsPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const queryClient = useQueryClient()
  const [filters, setFilters] = React.useState<AuthorQueryParams>({} as AuthorQueryParams)

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["authors", "filters"] })
  }, [filters])

  const form = useForm<AuthorFilters>({
    mode: "uncontrolled",
    initialValues: {
      order_by: "Nombre",
      full_name: "",
      birth_year: "",
      poems: "",
    }
  })

  const handleSubmit = async (values: typeof form.values) => {
    const updatedFilters: AuthorQueryParams = {
      order_by: values.order_by === "Año de nacimiento" ? "birth_date" : values.order_by === "Número de poemas" ? "poems" : "full_name",
      full_name: values.full_name,
      birth_year: values.birth_year,
      poems: values.poems,
    }

    setFilters(updatedFilters)
  }

  return (
    <Shell>
      <Container mt={40}>
        <Title order={1}>Lista de autores</Title>
      </Container>
      <Group hiddenFrom="sm" justify="flex-end" mt="xl" mr={60}>
        <Button
          variant="light"
          color="grey"
          leftSection={<TbFilter />}
          onClick={open}
        >
          Filtrar
        </Button>
      </Group>
      <Flex wrap="nowrap">
        <AuthorGrid filter={filters} />
        <Container visibleFrom="sm" w={400}>
          <Paper shadow="xl" p="lg" mr="xl" h={530} withBorder>
            <FilterAuthor form={form} handleSubmit={handleSubmit} />
          </Paper>
        </Container>
      </Flex>
      <Drawer
        offset={8}
        radius="md"
        opened={opened}
        onClose={close}
        title="Ordenar y filtrar"
        position="right"
        hiddenFrom="sm"
        padding="xl"
        size="xs"
      >
        <FilterAuthor form={form} handleSubmit={handleSubmit} />
      </Drawer>
    </Shell>
  )
}