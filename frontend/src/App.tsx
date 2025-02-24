import './App.css'
import '@mantine/core/styles.css';
import '@mantine/spotlight/styles.css';

import { 
  MantineProvider,
} from '@mantine/core';

import AllRoutes from './routes';
import { Search } from './components/Header/Search/Search';

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