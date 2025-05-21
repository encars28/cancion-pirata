import { useQuery } from "@tanstack/react-query"
import { callService } from "../utils"
import { poemsReadPoem } from "../client/sdk.gen"

const usePoem = (poem_id: string) => useQuery({
  queryKey: ['poems', poem_id],
  queryFn: async () => callService(poemsReadPoem, { path: { poem_id: poem_id } }),
  placeholderData: (prevData) => prevData,
})

export default usePoem