import {
  Overlay,
  Text,
  Title,
  Stack,
} from "@mantine/core";
import classes from "./Hero.module.css";


export function Hero() {
  return (
    <div className={classes.wrapper}>
      <Overlay color="#000" opacity={1} zIndex={1} />
      <Stack className={classes.inner} gap="xl">
        <Title  className={classes.title}>
          La canción del {""}
          <Text component="span" inherit className={classes.highlight}>
            poeta
          </Text>
        </Title>
        <Text className={classes.description} >
          Explora nuestra colección de poemas, donde podrás disfrutas poemas originales creados por nuestra comunidad.
        </Text>
      </Stack>
    </div>
  );
}
