import './App.css'
import '@mantine/core/styles.css';
import '@mantine/spotlight/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/tiptap/styles.css';

import {
  MantineProvider,
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import AllRoutes from './routes';
import { Search } from './components/Header/Search/Search';
import { client } from './client/client.gen';
import { isLoggedIn } from './hooks/useAuth';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { createSearchData } from './utils';

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
  const searchData = createSearchData()
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