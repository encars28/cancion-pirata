import { useQuery } from "@tanstack/react-query"
import { callService } from "../utils"
import { authorsReadAuthors } from "../client/sdk.gen"

const useAuthors = () => useQuery(
  {
    queryKey: ['authors'],
    queryFn: async () => callService(authorsReadAuthors),
    placeholderData: (prevData) => prevData,
  })

export default useAuthors