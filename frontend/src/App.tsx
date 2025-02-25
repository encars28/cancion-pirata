import './App.css'
import '@mantine/core/styles.css';
import '@mantine/spotlight/styles.css';

import { 
  MantineProvider,
} from '@mantine/core';

import AllRoutes from './routes';
import { Search } from './components/Header/Search/Search';
import { client } from './client/client.gen';

// configure internal service client
client.setConfig({
  baseUrl: import.meta.env.API_URL,
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
        </>
      }
    </MantineProvider>
  )
}

export default App