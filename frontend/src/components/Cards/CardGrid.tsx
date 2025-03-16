import { SimpleGrid } from '@mantine/core';

export function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <SimpleGrid
      cols={{ base: 3, xs: 4, sm: 5, md: 6, lg: 8, xl: 9 }}
      spacing="sm"
      verticalSpacing="xl"
      pb={200}
      m={{ base: 50, xs: 60, sm: 70, md: 80, lg: 90 }}
    >
      {children}
    </SimpleGrid>)
}