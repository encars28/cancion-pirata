import { useQuery } from "@tanstack/react-query"
import { callService } from "../utils"
import { poemsReadPoems } from "../client/sdk.gen"

const usePoems = () => useQuery(
  {
    queryKey: ['authors'],
    queryFn: async () => callService(poemsReadPoems),
    placeholderData: (prevData) => prevData,
  }
)

export default usePoems