import { TbSearch } from "react-icons/tb";
import { Spotlight, createSpotlight } from '@mantine/spotlight';
import { useNavigate } from "react-router";
import { PoemPublicBasic, AuthorPublicBasic } from "../../../client/types.gen";
import usePoems from "../../../hooks/usePoems";
import useAuthors from "../../../hooks/useAuthors";

export const [searchStore, searchHandlers] = createSpotlight();

export function Search() {
  const { data: poemsData } = usePoems({})
  const { data: authorsData } = useAuthors({})
  const navigate = useNavigate();

  const poems: PoemPublicBasic[] = poemsData?.data ?? []
  const authors: AuthorPublicBasic[] = authorsData?.data ?? []

  const actions =  [{
    'group': 'Autores',
    'actions': authors.map((author) => ({
      id: author.id,
      label: author.full_name,
      onClick: () => {navigate(`/authors/${author.id}`)},
    })),
  },
  {
    'group': 'Poemas',
    'actions': poems.map(
      (poem) => ({
        id: poem.id,
        label: poem.title,
        onClick: () => {navigate(`/poems/${poem.id}`)},
      })),
  }];

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
        leftSection: <TbSearch size={20} />,
        placeholder: 'Buscando...',
      }}
    />
  );
}