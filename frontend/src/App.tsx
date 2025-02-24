import './App.css'
import '@mantine/core/styles.css';

import { 
  MantineProvider,
} from '@mantine/core';

import AllRoutes from './routes';

function App() {
  return (
    <MantineProvider>
      {
        <AllRoutes />
      }
    </MantineProvider>
  )
}

export default App