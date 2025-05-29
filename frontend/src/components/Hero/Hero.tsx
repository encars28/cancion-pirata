import {
  Button,
  Overlay,
  Text,
  Title,
  Flex,
  Stack,
} from "@mantine/core";
import classes from "./Hero.module.css";
import { useNavigate } from "react-router";


export function Hero() {
  const navigate = useNavigate();

  return (
    <div className={classes.wrapper}>
      <Overlay color="#000" opacity={1} zIndex={1} />
      <Stack className={classes.inner} gap="xl">
        <Title ta="left" className={classes.title}>
          Descubre nuestros {""}
          <Text component="span" inherit className={classes.highlight}>
            poemas
          </Text>
        </Title>
        <Text className={classes.description} ta="left">
          Explora nuestra colección de poemas, donde además de clásicos podrás disfrutas poemas originales creados por nuestra comunidad.
        </Text>
        <Flex justify="flex-start" align="center" wrap="wrap" gap="xl" mt="xl" ml="lg">
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
