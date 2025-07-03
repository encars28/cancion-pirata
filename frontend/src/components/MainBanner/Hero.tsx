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
          Sumérgete en un universo de versos infinitos. En nuestra plataforma, puedes explorar una vasta colección de poemas originales creados por nuestra comunidad. Utiliza nuestro sistema de búsqueda y filtrado para encontrar precisamente lo que resuena contigo y crea tus propias colecciones personalizadas, organizando tus poemas favoritos. Da rienda suelta a tu creatividad escribiendo tus propios poemas con nuestro intuitivo lenguaje de marcado. Tu espacio para sentir, descubrir y crear poesía te espera.
        </Text>
      </Stack>
    </div>
  );
}
