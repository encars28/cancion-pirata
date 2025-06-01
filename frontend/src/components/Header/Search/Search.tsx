import { TbSearch } from "react-icons/tb";
import { Spotlight, createSpotlight } from "@mantine/spotlight";
import { useNavigate } from "react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { callService } from "../../../utils";
import {
  AuthorForSearch,
  CollectionForSearch,
  PoemForSearch,
  searchSearch,
  UserForSearch,
} from "../../../client";
import { Loader } from "@mantine/core";

export const [searchStore, searchHandlers] = createSpotlight();

export function Search() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const { data, isPending } = useQuery({
    queryKey: ["search", search],
    queryFn: async () => callService(searchSearch, { query: { q: search } }),
    placeholderData: (prevData) => prevData,
  });

  const poems: PoemForSearch[] = data?.poems ?? [];
  const authors: AuthorForSearch[] = data?.authors ?? [];
  const users: UserForSearch[] = data?.users ?? [];
  const collections: CollectionForSearch[] = data?.collections ?? [];

  const actions = authors
    .map((author) => ({
      id: author.id,
      label: author.full_name,
      description: "Autor",
      onClick: () => navigate(`/authors/${author.id}`),
    }))
    .concat(
      poems.map((poem) => ({
      id: poem.id,
      label: poem.title,
      description: "Poema",
      onClick: () => navigate(`/poems/${poem.id}`),
      }))
    ).concat(
      users.map((user) => ({
      id: user.id,
      label: user.username,
      description: "Usuario",
      onClick: () => navigate(`/users/${user.id}`),
      }))
    ).concat(
      collections.map((collection) => ({
      id: collection.id,
      label: collection.name,
      description: "Colección",
      onClick: () => navigate(`/collections/${collection.id}`),
      }))
    );

  return (
    <Spotlight
      store={searchStore}
      actions={actions || []}
      highlightQuery
      clearQueryOnClose
      scrollable
      radius="md"
      nothingFound="No se ha encontrado nada..."
      searchProps={{
        leftSection: isPending ? <Loader size="xs" /> : <TbSearch size={20} />,
        placeholder: "Buscando...",
      }}
      filter={(query, actions) => {
        setSearch(query);
        return actions;
      }}
    />
  );
}
