import { IconSearch } from '@tabler/icons-react';
import { Spotlight, createSpotlight } from '@mantine/spotlight';

export const [searchStore, searchHandlers] = createSpotlight();

export function Search({ data }: { data: any[] }) {

  const actions = data?.map((item) => ({
    id: item.component,
    label: item.component,
    description: item.attributes.title,
  }));

  return (
    <Spotlight
      store={searchStore}
      actions={actions || []}
      tagsToIgnore={[]}
      highlightQuery
      clearQueryOnClose
      radius="md"
      limit={7}
      nothingFound="No se ha encontrado nada..."
      searchProps={{
        leftSection: <IconSearch size={20} />,
        placeholder: 'Buscando...',
      }}
    />
  );
}