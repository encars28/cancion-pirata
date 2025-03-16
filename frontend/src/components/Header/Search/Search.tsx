import { TbSearch } from "react-icons/tb";
import { Spotlight, createSpotlight } from '@mantine/spotlight';
import { useNavigate } from 'react-router';

export const [searchStore, searchHandlers] = createSpotlight();

export function Search({ data }: { data: any[] }) {
  const navigate = useNavigate();
  const actions = data?.map((item) => ({
    id: item.label,
    label: item.label,
    description: item.description,
    onClick: () => {navigate(item.url)},
  }));

  return (
    <Spotlight
      store={searchStore}
      actions={actions || []}
      tagsToIgnore={[]}
      highlightQuery
      clearQueryOnClose
      radius="md"
      limit={8}
      nothingFound="No se ha encontrado nada..."
      searchProps={{
        leftSection: <TbSearch size={20} />,
        placeholder: 'Buscando...',
      }}
    />
  );
}