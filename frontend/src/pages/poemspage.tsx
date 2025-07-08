import { Shell } from "../components/Shell/Shell";
import { ActionIcon, Title, Affix, Tooltip } from "@mantine/core";
import { FilterPoem, PoemFilters } from "../components/Poem/FilterPoem";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { useQueryClient } from "@tanstack/react-query";
import { PoemGrid } from "../components/Poem/PoemGrid";
import { TbAdjustments, TbWritingSign } from "react-icons/tb";
import { Container, Drawer, Group } from "@mantine/core";
import { useSearchParams, useNavigate } from "react-router";
import { PoemSearchParams, SearchParams } from "../client";
import { isLoggedIn } from "../hooks/useAuth";

export const POEMS_PER_PAGE = 10;

export function PoemsPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<SearchParams>({
    search_type: ["poem"],
    poem_params: {
      poem_skip: 0,
      poem_limit: POEMS_PER_PAGE,
      poem_basic: false,
    },
  });
  const [searchParams] = useSearchParams();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["search", "poem"] });
  }, [filters]);

  const form = useForm<PoemFilters>({
    mode: "controlled",
    initialValues: {
      order_by: "Título",
      title: "",
      created_at: "",
      updated_at: "",
      language: "",
      authors: "",
      verses: "",
      desc: false,
    },
  });

  const page = searchParams.get("page")
    ? parseInt(searchParams.get("page") as string)
    : 1;

  const setPage = (page: number) => {
    navigate({ search: `?page=${page}` });
    setFilters({
      ...filters,
      poem_params: {
        ...filters.poem_params,
        poem_skip: (page - 1) * POEMS_PER_PAGE,
        poem_limit: POEMS_PER_PAGE,
      },
    });
  };

  const handleSubmit = async (values: typeof form.values) => {
    const updatedFilters: PoemSearchParams = {
      ...filters.poem_params,
      poem_order_by:
        values.order_by === "Fecha de publicación"
          ? "created_at"
          : values.order_by === "Fecha de modificación"
          ? "updated_at"
          : "title",
      poem_title: values.title,
      poem_author: values.authors,
      poem_created_at: values.created_at,
      poem_updated_at: values.updated_at,
      poem_language: values.language,
      poem_desc: values.desc,
      poem_skip: (page - 1) * POEMS_PER_PAGE,
      poem_limit: POEMS_PER_PAGE,
      poem_verses: values.verses,
      poem_type:
        values.type === "Todos"
          ? "all"
          : values.type === "Versión"
          ? "version"
          : values.type === "Traducción"
          ? "translation"
          : values.type === "Original"
          ? "original"
          : values.type === "Derivado"
          ? "derived"
          : "",
    };

    setFilters({ ...filters, poem_params: updatedFilters });
  };

  return (
    <Shell>
      <Group justify="center" mb={50} gap="xl">
        <Title ta="center" order={1}>
          Poemas
        </Title>
        <ActionIcon variant="default" onClick={open} size={40}>
          <TbAdjustments size={25} />
        </ActionIcon>
      </Group>
      <Container px={{ lg: 60 }} fluid>
        <PoemGrid filter={filters} setPage={setPage} />
      </Container>

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
        <FilterPoem form={form} handleSubmit={handleSubmit} />
      </Drawer>
      {!opened && (
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
      )}
    </Shell>
  );
}
