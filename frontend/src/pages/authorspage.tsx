import { Shell } from "../components/Shell/Shell";
import { CardGrid, CardGridProps } from "../components/CardGrid";
import { Container, Paper, Drawer, Avatar, Text, Title, Button, Group, Flex } from "@mantine/core";
import { handleError } from "../utils";
import { Loading } from "../components/Loading";
import { AuthorPublicWithPoems } from "../client";
import { useForm } from "@mantine/form";
import useAuthors, { AuthorQueryParams } from "../hooks/useAuthors";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import { FilterAuthor, AuthorFilters } from "../components/Author/FilterAuthor";
import { TbFilter } from "react-icons/tb";

export function AuthorsPage() {
  const [filters, setFilters] = useState<AuthorQueryParams>({})
  const [opened, { open, close }] = useDisclosure(false);
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
    const updatedFilters: AuthorQueryParams = {
      order_by: values.order_by === "Año de nacimiento" ? "birth_date" : values.order_by === "Número de poemas" ? "poems" : "full_name",
      full_name: values.full_name,
      birth_year: values.birth_year,
      poems: values.poems,
    }
    console.log(updatedFilters)
    setFilters(updatedFilters)
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
        <CardGrid data={cardData} />
        <Container visibleFrom="sm" w={400}>
          <Paper shadow="xl" p="lg" mr="xl" h={500} withBorder>
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