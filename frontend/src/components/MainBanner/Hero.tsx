import {
  Button,
  Overlay,
  Text,
  Title,
  Flex,
  Stack,
} from "@mantine/core";
import classes from "./Hero.module.css";


export function Hero() {
  return (
    <div className={classes.wrapper}>
      <Overlay color="#000" opacity={1} zIndex={1} />
      <Stack className={classes.inner} gap="xl">
        <Title  className={classes.title}>
          Descubre nuestros {""}
          <Text component="span" inherit className={classes.highlight}>
            poemas
          </Text>
        </Title>
        <Text className={classes.description} >
          Explora nuestra colección de poemas, donde además de clásicos podrás disfrutas poemas originales creados por nuestra comunidad.
        </Text>
      </Stack>
    </div>
  );
}
