import { useQuery } from "@tanstack/react-query"
import { callService } from "../utils"
import { poemsReadPoems } from "../client/sdk.gen"

export interface PoemQueryParams {
  order_by?: "created_at" | "updated_at" | "title"
  type?: "all" | "version" | "translation" | "derived" | "original" | ""
  title?: string;
  created_at?: string;
  updated_at?: string;
  language?: string;
  desc?: boolean;
  limit?: number;
  skip?: number;
}

const usePoems = (params: PoemQueryParams) => useQuery(
  {
    queryKey: Object.keys(params).length === 0 ? ['poems'] : ['poems', 'filters'],
    queryFn: async () => callService(poemsReadPoems, { query: { ...params } }),
    placeholderData: (prevData) => prevData,
  }
)

export default usePoems