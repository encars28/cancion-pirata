import { TbSearch } from "react-icons/tb";
import { Spotlight, createSpotlight } from "@mantine/spotlight";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";

import { Loader } from "@mantine/core";
import useSearch from "../hooks/useSearch";
import {
  AuthorPublicBasic,
  CollectionPublicBasic,
  PoemPublicBasic,
  UserPublicBasic,
} from "../client";
import { useQueryClient } from "@tanstack/react-query";

export const [searchStore, searchHandlers] = createSpotlight();

export function Search() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient()
  const { isPending, data: searchData } = useSearch({
    search_type: ["author", "poem", "user", "collection"],
    poem_params: { poem_title: search },
    author_params: { author_full_name: search },
    user_params: { user_name: search, user_skip_authors: true },
    collection_params: { collection_name: search },
  });

  useEffect(() => {
    queryClient.invalidateQueries({queryKey: ["search"]});
  }, [search]);

  const authors = searchData?.authors as AuthorPublicBasic[] ?? [];
  const poems = searchData?.poems as PoemPublicBasic[] ?? [];
  const users = searchData?.users as UserPublicBasic[] ?? [];
  const collections = searchData?.collections as CollectionPublicBasic[] ?? [];

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
    )
    .concat(
      users.map((user) => ({
        id: user.id,
        label: user.username,
        description: "Usuario",
        onClick: () => navigate(`/users/${user.id}`),
      }))
    )
    .concat(
      collections.map((collection) => ({
        id: collection.id,
        label: collection.name,
        description: "Colección",
        onClick: () => navigate(`/collections/${collection.id}`),
      }))
    );

  return (
    <Spotlight
      query={search}
      onQueryChange={(search) => {
        setSearch(search);
      }}
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
      filter={(_, actions) =>
        // Don't filter; search is already done
        actions
      }
    />
  );
}
