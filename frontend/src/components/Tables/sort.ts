import { keys } from '@mantine/core';

export function filterData(data: any[], search: string) {
  const query = search.toLowerCase().trim();
  return data.filter((item) =>
    keys(data[0]).some((key) => typeof item[key] === 'string' ? item[key].toLowerCase().includes(query) : false) 
  );
}

export function sortData(
  data: any[],
  payload: { sortBy: any; reversed: boolean; search: string }
) {
  const { sortBy } = payload;

  if (!sortBy) {
    return filterData(data, payload.search);
  }

  return filterData(
    [...data].sort((a, b) => {
      if (payload.reversed) {
        return b[sortBy].localeCompare(a[sortBy]);
      }

      return a[sortBy].localeCompare(b[sortBy]);
    }),
    payload.search
  );
}