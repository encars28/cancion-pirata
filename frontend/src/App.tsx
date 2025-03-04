import './App.css'
import '@mantine/core/styles.css';
import '@mantine/spotlight/styles.css';
import '@mantine/notifications/styles.css';

import {
  MantineProvider,
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import AllRoutes from './routes';
import { Search } from './components/UI/Header/Search/Search';
import { client } from './client/client.gen';

// configure internal service client
client.setConfig({
  // set default base url for requests
  baseUrl: 'http://localhost:8000',
  // set default headers for requests
  // headers: {
  //   Authorization: 'Bearer <token_from_service_client>',
  // },
});

function App() {
  return (
    <MantineProvider>
      {
        <>
          <AllRoutes />
          <Search data={[]} />
          <Notifications />
        </>
      }
    </MantineProvider>
  )
}

export default App