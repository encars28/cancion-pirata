import { Button, Center, Overlay, Text, Title, Flex, Stack } from '@mantine/core';
import classes from './Hero.module.css';
import { useNavigate } from 'react-router';

export function Hero() {
  const navigate = useNavigate();
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
          {/* <Text ta="center" className={classes.description}>
            Poemas! Navega nuestro gran y amplio catálogo de poemas y autores.
          </Text> */}
          <Text ta="center" className={classes.description}>
            “If you know the enemy and know yourself, you need not fear the result of a hundred battles.<br />
            If you know yourself but not the enemy, for every victory gained you will also suffer a defeat. <br />
            If you know neither the enemy nor yourself, you will succumb in every battle.”
            <Text ta="right" pt="md" size="md">-- Sun Tzu, The Art of War</Text>
          </Text>
        </Center>
        <Flex
          justify="center"
          align="center"
          wrap="wrap"
          gap="xl"
          mt="xl"
        >
          <Button
            className={classes.control}
            variant="white"
            onClick={() => navigate("/poems")}
          >
            Poemas
          </Button>
          <Button
            className={classes.control}
            onClick={() => navigate("/authors")}
          >
            Autores
          </Button>
        </Flex>
      </Stack>
    </div>
  );
}