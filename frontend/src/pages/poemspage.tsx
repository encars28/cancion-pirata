import { Shell } from "../components/Shell/Shell";
import { ActionIcon, Title } from "@mantine/core";
import { PoemQueryParams } from "../hooks/usePoems";
import { FilterPoem, PoemFilters } from "../components/Poem/FilterPoem";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { useQueryClient } from "@tanstack/react-query";
import { PoemGrid } from "../components/Poem/PoemGrid/PoemGrid";
import { TbAdjustments, TbFilter } from "react-icons/tb";
import {
  Container,
  Space,
  Paper,
  Drawer,
  Button,
  Group,
  Flex,
} from "@mantine/core";
import { useSearchParams, useNavigate } from "react-router";

export const POEMS_PER_PAGE = 10;

export function PoemsPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<PoemQueryParams>({
    skip: 0,
    limit: POEMS_PER_PAGE,
  } as PoemQueryParams);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["poems", "filters"] });
  }, [filters]);

  const form = useForm<PoemFilters>({
    mode: "controlled",
    initialValues: {
      order_by: "Título",
      title: "",
      created_at: "",
      updated_at: "",
      language: "",
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
      skip: (page - 1) * POEMS_PER_PAGE,
      limit: POEMS_PER_PAGE,
    });
  };

  const handleSubmit = async (values: typeof form.values) => {
    const updatedFilters: PoemQueryParams = {
      order_by:
        values.order_by === "Fecha de publicación"
          ? "created_at"
          : values.order_by === "Fecha de modificación"
          ? "updated_at"
          : "title",
      title: values.title,
      created_at: values.created_at,
      updated_at: values.updated_at,
      desc: values.desc,
      skip: (page - 1) * POEMS_PER_PAGE,
      limit: POEMS_PER_PAGE,
      verses: values.verses,
      type:
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

    setFilters(updatedFilters);
  };

  return (
    <Shell>
      <Group justify="center" mt={50} mb={50} gap="xl">
        <Title ta="center" order={1}>
          Poemas
        </Title>
        <ActionIcon variant="default" onClick={open} size={40}>
          <TbAdjustments size={25} />
        </ActionIcon>
      </Group>
      <Container px={{base: "xl", lg:60}} fluid>
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
    </Shell>
  );
}
