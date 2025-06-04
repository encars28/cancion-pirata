import './App.css'
import '@mantine/core/styles.css';
import '@mantine/spotlight/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/tiptap/styles.css';
import '@mantine/dropzone/styles.css';

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
import { ModalsProvider } from '@mantine/modals';

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
  return (
    <MantineProvider>
      {
        <>
          <AllRoutes />
          <Search />
          <Notifications />
          <ModalsProvider labels={{ confirm: 'Continuar', cancel: 'Cancelar' }} />
        </>
      }
    </MantineProvider>
  )
}

export default App