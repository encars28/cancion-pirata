import { Shell } from "../components/Shell/Shell";
import { Title } from "@mantine/core";
import { PoemQueryParams } from "../hooks/usePoems";
import { FilterPoem, PoemFilters } from "../components/Poem/FilterPoem";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { useQueryClient } from "@tanstack/react-query";
import { PoemGrid } from "../components/Poem/PoemGrid";
import { TbFilter } from "react-icons/tb";
import { Container, Paper, Drawer, Button, Group, Flex } from "@mantine/core";
import { useSearchParams, useNavigate } from "react-router";

export const POEMS_PER_PAGE = 36

export function PoemsPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<PoemQueryParams>({ skip: 0, limit: POEMS_PER_PAGE } as PoemQueryParams)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["poems", "filters"] })
  }, [filters])

  const form = useForm<PoemFilters>({
    mode: "controlled",
    initialValues: {
      order_by: "Título",
      title: "",
      created_at: "",
      updated_at: "",
      language: "",
      desc: false,
    }
  })

  const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1

  const setPage = (page: number) => {
    navigate({ search: `?page=${page}` });
    setFilters({
      ...filters,
      skip: (page - 1) * POEMS_PER_PAGE,
      limit: POEMS_PER_PAGE,
    })
  }

  const handleSubmit = async (values: typeof form.values) => {
    const updatedFilters: PoemQueryParams = {
      order_by: values.order_by === "Fecha de publicación" ? "created_at" : values.order_by === "Fecha de modificación" ? "updated_at" : "title",
      title: values.title,
      created_at: values.created_at,
      updated_at: values.updated_at,
      desc: values.desc,
      skip: (page - 1) * POEMS_PER_PAGE,
      limit: POEMS_PER_PAGE
    }

    setFilters(updatedFilters)
  }

  return (
    <Shell>
      <Container mt={40}>
        <Title order={1}>Lista de poemas</Title>
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
        <PoemGrid filter={filters} setPage={setPage}/>
        <Container visibleFrom="sm" w={400}>
          <Paper shadow="xl" p="lg" mr="xl" h={600} withBorder>
            <FilterPoem form={form} handleSubmit={handleSubmit} />
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
        <FilterPoem form={form} handleSubmit={handleSubmit} />
      </Drawer>
    </Shell>
  )
}