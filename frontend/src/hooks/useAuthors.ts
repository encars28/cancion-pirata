import { useQuery } from "@tanstack/react-query"
import { callService } from "../utils"
import { authorsReadAuthors } from "../client/sdk.gen"

export interface AuthorQueryParams {
  order_by?: "full_name" | "poems" | "birth_date";
  full_name?: string;
  birth_year?: string;
  poems?: string;
  desc?: boolean;
  limit?: number;
  skip?: number;
}

const useAuthors = (params: AuthorQueryParams) => useQuery(
  {
    queryFn: async () =>
      callService(authorsReadAuthors, { query: { ...params } }),
    queryKey: ["authors", "filters"],
    placeholderData: (prevData) => prevData,
  })

export default useAuthors