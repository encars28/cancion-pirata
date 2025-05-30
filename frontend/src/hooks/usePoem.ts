import { useQuery } from "@tanstack/react-query"
import { callService } from "../utils"
import { poemsReadPoem } from "../client/sdk.gen"

const usePoem = (poem_id: string, parse_poem: boolean) => useQuery({
  queryKey: ['poems', poem_id, parse_poem],
  queryFn: async () => callService(poemsReadPoem, { path: { poem_id: poem_id}, query: { parse: parse_poem} }),
  placeholderData: (prevData) => prevData,
})

export default usePoem