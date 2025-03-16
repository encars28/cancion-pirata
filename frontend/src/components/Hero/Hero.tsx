import { Button, Center, Overlay, Text, Title, Flex, Stack, Space } from '@mantine/core';
import classes from './Hero.module.css';

export function Hero() {
  return (
    <div className={classes.wrapper}>
      <Overlay color="#000" opacity={1} zIndex={1} />
      <Stack className={classes.inner} gap="xl">
        <Center>
          <Title ta="center" className={classes.title}>
            Descubre nuestros {''}
            <Text component="span" inherit className={classes.highlight}>
              poemas
            </Text>
          </Title>
        </Center>
        <Center>
          <Text ta="center" className={classes.description}>
            Poemas! Navega nuestro gran y amplio catálogo de poemas y autores.
          </Text>
        </Center>
        <Flex
          justify="center"
          align="center"
          wrap="wrap"
          gap="xl"
          mt="xl"
        >
          <Button className={classes.control} variant="white">
            Poemas
          </Button>
          <Button className={classes.control}>
            Autores
          </Button>
        </Flex>
      </Stack>
    </div>
  );
}