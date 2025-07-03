import { Shell } from "../components/Shell/Shell";
import { ActionIcon, Drawer, Group, Title, Affix, Tooltip } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useQueryClient } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import { FilterAuthor, AuthorFilters } from "../components/Author/FilterAuthor";
import { TbAdjustments, TbWritingSign } from "react-icons/tb";
import { useEffect, useState } from "react";
import { ShowAuthorGrid } from "../components/Author/ShowAuthorGrid";
import { useSearchParams, useNavigate } from "react-router";
import { AuthorSearchParams, SearchParams } from "../client";
import { isLoggedIn } from "../hooks/useAuth";


export const AUTHORS_PER_PAGE = 36;

export function AuthorsPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<SearchParams>({
    search_type: ["author"],
    author_params: { author_skip: 0, author_limit: AUTHORS_PER_PAGE, author_basic: false },
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["search", "author"] });
  }, [filters]);

  const form = useForm<AuthorFilters>({
    mode: "controlled",
    initialValues: {
      order_by: "Nombre",
      full_name: "",
      birth_year: "",
      death_year: "",
      poems: "",
    },
  });

  const page = searchParams.get("page")
    ? parseInt(searchParams.get("page") as string)
    : 1;
  const setPage = (page: number) => {
    navigate({ search: `?page=${page}` });
    setFilters({
      ...filters,
      author_params: {
        ...filters.author_params,
        author_skip: (page - 1) * AUTHORS_PER_PAGE,
        author_limit: AUTHORS_PER_PAGE,
      },
    });
  };

  const handleSubmit = async (values: typeof form.values) => {
    const updatedFilters: AuthorSearchParams = {
      author_order_by:
        values.order_by === "Año de nacimiento"
          ? "birth_date"
          : values.order_by === "Año de fallecimiento"
          ? "death_date"
          : values.order_by === "Número de poemas"
          ? "poems"
          : "full_name",
      author_full_name: values.full_name,
      author_birth_date: values.birth_year,
      author_death_date: values.death_year,
      author_poems: values.poems,
      author_desc: values.desc,
      author_skip: (page - 1) * AUTHORS_PER_PAGE,
      author_limit: AUTHORS_PER_PAGE,
    };

    setFilters({...filters, author_params: updatedFilters});
  };

  return (
    <Shell>
      <Group justify="center" gap="xl" mb={80}>
        <Title ta="center" order={1}>
          Autores
        </Title>
        <ActionIcon variant="default" onClick={open} size={40}>
          <TbAdjustments size={25} />
        </ActionIcon>
      </Group>
      <ShowAuthorGrid filter={filters} setPage={setPage} />
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
            <Affix bottom={{ base: 100, xs: 60 }} right={{ base: 30, xs: 70 }}>
                <Tooltip label="Nuevo poema">
                  <ActionIcon
                    size={50}
                    variant="filled"
                    radius="xl"
                    onClick={
                      isLoggedIn()
                        ? () => navigate("/poems/add")
                        : () => navigate("/login")
                    }
                  >
                    <TbWritingSign size={25} />
                  </ActionIcon>
                </Tooltip>
            </Affix>
    </Shell>
  );
}
