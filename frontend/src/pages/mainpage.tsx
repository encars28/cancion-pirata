import {
    Text,
    Button,
    Group,
    Space,
    Stack
} from '@mantine/core';

import { Shell } from '../components/Shell/Shell';

function ShowQuote() {
    return (  
      <Stack align='center'>      
        <Text>
          “If you know the enemy and know yourself, you need not fear the result of a hundred battles.<br />
          If you know yourself but not the enemy, for every victory gained you will also suffer a defeat. <br />
          If you know neither the enemy nor yourself, you will succumb in every battle.”
        </Text>
        <Text pl={{base: 250, xs: 400, sm: 450, md: 500, lg: 500}}>-- Sun Tzu, The Art of War</Text>
      </Stack>
    )
}

export function MainPage() {
    return (
      <Shell>
        <Stack justify='center' gap="xl">
          <ShowQuote />
          <Space h="lg" />
          <Group justify='center' gap="xl">
            <Button 
              variant='default' 
              w={200} 
              component='a' 
              href='/poems'
            >
              Ver Poemas
            </Button>
            <Button 
              variant='default' 
              component='a'
              href='/authors'
              w={200}
            >
              Ver Autores
            </Button>
          </Group>
        </Stack>
      </Shell>
    )
}


