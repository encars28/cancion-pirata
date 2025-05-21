import { Blockquote, Stack } from "@mantine/core"
import { TbVocabulary } from "react-icons/tb";

export function InfoBox({children}: {children: React.ReactNode}) {
    return (
        <Blockquote
        color="blue"
        radius="xl"
        iconSize={60}
        icon={<TbVocabulary size={25} />}
        m="xl"
        miw={200}
        maw={{base: 250, lg: 300}}>
          <Stack
            justify='center'
            h="100%"
          >
            {children}
          </Stack>
        </Blockquote>
    )
}