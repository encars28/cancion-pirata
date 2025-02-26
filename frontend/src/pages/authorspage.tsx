import { Shell } from "../components/UI/Shell/Shell";
import { AuthorCard } from "../components/UI/AuthorCard";
import { SimpleGrid, Space, Title } from "@mantine/core";
import { authorsReadAuthors } from "../client/sdk.gen";

const example = () => {
  const content = [];
  for (let index = 0; index < 8; index++) {
    content.push(<AuthorCard path="/" name="Autor" />);
  }

  return content;
}

export function AuthorsPage() {

  const authors = authorsReadAuthors();

  return (
    <Shell>
      <Title order={1}>Lista de autores</Title>
      <Space h="xl" />
      <SimpleGrid 
        cols={{ base: 3, xs: 4, sm: 5, md: 6, lg: 7, xl: 8}}
        spacing="xl" 
        verticalSpacing="xl"
        mt="xl"
      >
        {example()}
      </SimpleGrid>
    </Shell>
  )
}