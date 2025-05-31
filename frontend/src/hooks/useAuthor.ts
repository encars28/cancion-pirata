import { useQuery } from "@tanstack/react-query"
import { callService } from "../utils"
import { authorsReadAuthorById } from "../client/sdk.gen"

const useAuthor = (author_id: string) => useQuery({
  queryKey: ['authors', author_id],
  queryFn: async () => callService(authorsReadAuthorById, { path: { author_id: author_id} }),
  placeholderData: (prevData) => prevData,
})

export default useAuthor