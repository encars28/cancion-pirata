import './App.css'
import '@mantine/core/styles.css';
import '@mantine/spotlight/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

import {
  MantineProvider,
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import AllRoutes from './routes';
import { Search } from './components/Header/Search/Search';
import { client } from './client/client.gen';

import { poemsReadPoems } from "./client/sdk.gen";
import { useQuery } from '@tanstack/react-query';
import { PoemPublicWithAllTheInfo } from './client';
import { authorsReadAuthors } from './client/sdk.gen';
import { AuthorPublicWithPoems } from './client';
import { isLoggedIn } from './hooks/useAuth';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { callService } from './utils';

dayjs.extend(customParseFormat);

// configure internal service client
client.setConfig({
  baseUrl: 'http://localhost:8000',
});

if (isLoggedIn()) {
  client.setConfig({
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("access_token")}`
    }
  })
}

function App() {
  const { data: poemsData } = useQuery(
    {
      queryKey: ['poems'],
      queryFn: async () => callService(poemsReadPoems),
    }
  )

  const { data: authorsData } = useQuery(
    {
      queryKey: ['authors'],
      queryFn: async () => callService(authorsReadAuthors),
    }
  )

  const authors: AuthorPublicWithPoems[] = authorsData?.data ?? [];
  const poems: PoemPublicWithAllTheInfo[] = poemsData?.data ?? [];

  const searchData = authors.map(
    (author) => ({
      label: author.full_name,
      description: "Autor",
      url: `/authors/${author.id}`
    })).concat(
  poems.map(
    (poem) => ({
      label: poem.title,
      description: "Poema",
      url: `/poems/${poem.id}`
  })))

  return (
    <MantineProvider>
      {
        <>
          <AllRoutes />
          <Search data={searchData} />
          <Notifications />
        </>
      }
    </MantineProvider>
  )
}

export default App