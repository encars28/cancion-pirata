import { Shell } from "../components/Shell/Shell";
import { ActionIcon, Drawer, Group, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { AuthorQueryParams } from "../hooks/useAuthors";
import { useQueryClient } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import { FilterAuthor, AuthorFilters } from "../components/Author/FilterAuthor";
import { TbAdjustments } from "react-icons/tb";
import React, { useEffect } from "react"
import { AuthorGrid } from "../components/Author/AuthorGrid";
import { useSearchParams, useNavigate } from "react-router";

export const AUTHORS_PER_PAGE = 36

export function AuthorsPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const queryClient = useQueryClient()
  const [filters, setFilters] = React.useState<AuthorQueryParams>({skip: 0, limit: AUTHORS_PER_PAGE} as AuthorQueryParams)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["authors", "filters"] })
  }, [filters])

  const form = useForm<AuthorFilters>({
    mode: "controlled",
    initialValues: {
      order_by: "Nombre",
      full_name: "",
      birth_year: "",
      poems: "",
    }
  })

    const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1
    const setPage = (page: number) => {
      navigate({ search: `?page=${page}` });
      setFilters({
        ...filters,
        skip: (page - 1) * AUTHORS_PER_PAGE,
        limit: AUTHORS_PER_PAGE,
      })
    }

  const handleSubmit = async (values: typeof form.values) => {
    const updatedFilters: AuthorQueryParams = {
      order_by: values.order_by === "Año de nacimiento" ? "birth_date" : values.order_by === "Número de poemas" ? "poems" : "full_name",
      full_name: values.full_name,
      birth_year: values.birth_year,
      poems: values.poems,
      desc: values.desc,
      skip: (page - 1) * AUTHORS_PER_PAGE,
      limit: AUTHORS_PER_PAGE
    }

    setFilters(updatedFilters)
  }

  return (
    <Shell>
      <Group justify="center" mt={50} mb={50} gap="xl">
        <Title ta="center" order={1}>
          Autores
        </Title>
        <ActionIcon variant="default" onClick={open} size={40}>
          <TbAdjustments size={25} />
        </ActionIcon>
      </Group>
      <AuthorGrid filter={filters} setPage={setPage} />
      <Drawer
        offset={8}
        radius="md"
        opened={opened}
        onClose={close}
        title="Ordenar y filtrar"
        position="right"
        padding="xl"
        size="sm"
      >
        <FilterAuthor form={form} handleSubmit={handleSubmit} />
      </Drawer>
    </Shell>
  )
}