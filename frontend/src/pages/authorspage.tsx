import { Shell } from "../components/Shell/Shell";
import { CardGrid, CardGridProps } from "../components/CardGrid";
import { Group, Container, Avatar, Text, Title, Button, SimpleGrid, Grid, Paper, Select, TextInput, Stack, NumberInput, Space } from "@mantine/core";
import { handleError } from "../utils";
import { Loading } from "../components/Loading";
import useAuthors from "../hooks/useAuthors";
import { AuthorPublicWithPoems } from "../client";
import { TbFilter } from "react-icons/tb";
import { useDisclosure } from "@mantine/hooks";
import { FilterInfoButton } from "../components/FilterInfoButton";


export function AuthorsPage() {
  const { data, error, isPending, isError } = useAuthors();

  if (isPending) {
    return (<Loading />)
  }

  if (isError) {
    handleError(error as any);
  }

  const authors: AuthorPublicWithPoems[] = data?.data ?? []
  const authorCount: number = data?.count ?? 0

  const cardData: CardGridProps[] = authors.map((author) => ({
    path: `/authors/${author.id}`,
    icon: <Avatar name={author.full_name} key={author.full_name} color="initials" size="xl" />,
    description: <Text mt="md" size="sm">{author.full_name}</Text>
  }))

  return (
    <Shell>
      <Container mt={40}>
        <Title order={1}>Lista de autores</Title>
        <Title order={2} c="dimmed" fw="inherit">Total: {authorCount}</Title>
      </Container>
      <Grid columns={24}>
        <Grid.Col span={19}>
          <CardGrid data={cardData} />
        </Grid.Col>
        <Grid.Col span={5}>
          <Paper shadow="xl" p="lg" mr="xl" h={500} withBorder>
            <Stack gap="sm" ta="left" mt="md">
              <Select
                label="Ordenar por"
                defaultValue="Nombre"
                data={["Nombre", "Año de nacimiento", "Número de poemas"]}
                allowDeselect={false}
                radius="lg"
                variant="filled"
              />
              <Space h="md" />
              <TextInput
                label="Nombre"
                placeholder="Nombre"
                radius="md"
                styles={{input: { color: "grey"}}}
              />
              <TextInput
                label={<>Año de nacimiento<FilterInfoButton /> </>}
                placeholder="Año de nacimiento"
                radius="md"
                styles={{input: { color: "grey"}}}
              />
              <TextInput
                label={<>Número de poemas<FilterInfoButton /> </>}
                placeholder="Número de poemas"
                radius="md"
                styles={{input: { color: "grey"}}}
              />
              <Space h="md" />
              <Button
                variant="light"
                color="grey"
                leftSection={<TbFilter />}
                fullWidth
                radius="lg"
              >
                Ordenar y filtrar
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Shell>
  )
}