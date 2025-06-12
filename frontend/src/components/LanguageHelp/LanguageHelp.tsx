import {
  Stack,
  Group,
  Paper,
  Text,
  Title,
  TableOfContents,
  Mark,
  Container,
} from "@mantine/core";
import classes from "./LanguageHelp.module.css";
import { TbListSearch } from "react-icons/tb";

export function LanguageHelp() {
  return (
    <Group wrap="nowrap">
      <Stack pl={80} pr={{ base: 80, md: "md" }} gap={80} pb={200}>
        <Title order={1} ta="center">
          Ayuda para escribir poemas
        </Title>
        <Stack gap={80}>
          <Stack>
            <Title order={3} className={classes.title}>
              Versos y estrofas
            </Title>
            <Text>
              Para simbolizar el cambio de un verso a otro se utiliza{" "}
              <Text span className={classes.code}>
                un salto de línea (\n)
              </Text>
              . Para simbolizar el cambio de una estrofa a otra se utilizan
              <Text span className={classes.code}>
                {" "}
                dos saltos de línea (\n\n)
              </Text>
              .
            </Text>
            <Paper className={classes.example} withBorder>
              Este es un verso
              <br />
              Este es otro verso
              <br />
              <br />
              Este es el primer verso de una estrofa
              <br />
              Este es el segundo verso de la misma estrofa
              <br />
            </Paper>
          </Stack>
          <Stack>
            <Title order={3} className={classes.title}>
              Alinear texto
            </Title>
            <Text>
              Los poemas se alinean al centro por defecto. Para cambiar el
              alinieamiento del texto añade{" "}
              <Text span className={classes.code}>
                center
              </Text>
              ,{" "}
              <Text span className={classes.code}>
                left
              </Text>{" "}
              o{" "}
              <Text span className={classes.code}>
                right
              </Text>{" "}
              al principio del segmento de texto entre símbolos de menor y
              mayor.
            </Text>
            <Paper className={classes.example} withBorder>
              &lt;center&gt;
              <br />
              Este es un texto centrado
              <br />
              &lt;left&gt;
              <br />
              Este es un texto alineado a la izquierda
              <br />
              &lt;right&gt;
              <br />
              Este es un texto alineado a la derecha
            </Paper>
          </Stack>
          <Stack>
            <Title order={3} className={classes.title}>
              Formatear palabras
            </Title>
            <Stack gap="xs">
              <Text>
                Para poner una palabra en{" "}
                <Text span fw="bold">
                  negrita
                </Text>{" "}
                colocala entre doble asteriscos{" "}
                <Text span className={classes.code}>
                  (**negrita**)
                </Text>
              </Text>
              <Paper className={classes.example} withBorder>
                **Esta es una frase en negrita**
              </Paper>
            </Stack>
            <Stack gap="xs">
              <Text>
                Para poner una palabra en{" "}
                <Text span fs="italic">
                  cursiva
                </Text>
                , colócala entre asteriscos{" "}
                <Text span className={classes.code}>
                  (*cursiva*)
                </Text>
              </Text>
              <Paper className={classes.example} withBorder>
                *Esta es una frase en cursiva*
              </Paper>
            </Stack>
            <Stack gap="xs">
              <Text>
                Para poner una palabra{" "}
                <Text span td="line-through">
                  tachada
                </Text>
                , colócala entre virgulillas{" "}
                <Text span className={classes.code}>
                  (~tachado~)
                </Text>
              </Text>
              <Paper className={classes.example} withBorder>
                ~Esta es una frase tachada~
              </Paper>
            </Stack>
            <Stack gap="xs">
              <Text>
                Para poner una palabra{" "}
                <Text span td="underline">
                  subrayada
                </Text>
                , colócala entre guiones bajos{" "}
                <Text span className={classes.code}>
                  (_subrayada_)
                </Text>
              </Text>
              <Paper className={classes.example} withBorder>
                _Esta es una frase subrayada_
              </Paper>
            </Stack>
            <Stack gap="xs">
              <Text>
                Para poner una palabra <Mark>marcada</Mark>, colócala entre
                iguales{" "}
                <Text span className={classes.code}>
                  (=marcada=)
                </Text>
                . Por defecto, el color de la marca es amarillo, pero se puede
                especificar un color entre paréntesis justo después de los
                iguales para cambiar esto. Los colores pueden ser nombres de
                colores en inglés o códigos hexadecimales{" "}
                <Text span className={classes.code}>
                  (=marcada=(color))
                </Text>
              </Text>
              <Paper className={classes.example} withBorder>
                =Esta es una frase marcada de amarillo=
                <br />
                =Esta es una frase marcada de azul=(blue)
                <br />
                =Esta es una frase marcada de verde=(#00FF00)
              </Paper>
            </Stack>
          </Stack>
          <Stack>
            <Title order={3} className={classes.title}>
              Cambiar el tamaño de la fuente
            </Title>
            <Text>
              Para cambiar el tamaño de la fuente de un segmento de texto, mete
              dicho segmento entre símbolos de menor y mayor y añade el tamaño
              deseado en píxeles entre paréntesis{" "}
              <Text span className={classes.code}>
                &lt;palabra&gt;(tamaño)
              </Text>
              .
            </Text>
            <Paper className={classes.example} withBorder>
              &lt;Este es un texto con tamaño de fuente 50px&gt;(50)
              <br />
              &lt;Este es un texto con tamaño de fuente 30px&gt;(30)
            </Paper>
          </Stack>
          <Stack>
            <Title order={3} className={classes.title}>
              Añadir indentación
            </Title>
            <Text>
              Para añadir indentación a un verso añade el número de caracteres
              que quieres que se intente al principio del verso seguido de un
              síbmlo de mayor.{" "}
              <Text span className={classes.code}>
                (indentación&gt;)
              </Text>
            </Text>
            <Paper className={classes.example} withBorder>
              4&gt;Este verso tiene 4 caracteres de indentación
              <br />
              8&gt;Este verso tiene 8 caracteres de indentación
            </Paper>
          </Stack>
          <Stack>
            <Title order={3} className={classes.title}>
              Añadir cesuras
            </Title>
            <Text>
              Para añadir una cesura a un verso, añade dos barras horizontales{" "}
              <Text span className={classes.code}>
                //
              </Text>
              en el lugar donde quieras que se produzca la cesura.
            </Text>
            <Paper className={classes.example} withBorder>
              Este verso tiene una cesura // en este lugar
              <br />
              Este verso tiene dos cesuras // en este lugar // y en este otro
            </Paper>
          </Stack>
        </Stack>
      </Stack>
      <Container visibleFrom="md" ml={100} w={{base: 1000, xl: 800}}>
        <Container className={classes.contents}>
          <Stack gap="lg">
            <Group wrap="nowrap">
              <TbListSearch />
              <Text>Tabla de contenidos</Text>
            </Group>
            <TableOfContents
              variant="light"
              size="md"
              radius="sm"
              getControlProps={({ data }) => ({
                onClick: () => data.getNode().scrollIntoView(),
                children: data.value,
              })}
            />
          </Stack>
        </Container>
      </Container>
    </Group>
  );
}
