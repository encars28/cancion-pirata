import { Flex, Stack, Text, Title } from '@mantine/core';
import classes from './ErrorPages.module.css';
import { Shell } from '../Shell/Shell';

export function ServerError() {
  return (
    <Shell noPaddingTop>
      <Flex className={classes.background} justify="center" align="center">
        <Text
          className={classes.text}
          fz={{ base: 200, xs: 250, sm: 300, md: 400, lg: 500 }}
        >
          500
        </Text>
      </Flex>
      <Stack className={classes.content} justify='center' align='center' h='100%' gap="xl">
        <Title className={classes.title}>Error interno del servidor</Title>
        <Text c="dimmed" size="lg" ta="center" maw={550}>
          El servidor está teniendo problemas para procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.
          Si el problema persiste, contacta al administrador del sitio.
        </Text> 
      </Stack>
    </Shell>
  );
}