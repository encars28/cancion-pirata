import { SearchParams, searchSearch } from "../client";
import { callService } from "../utils";
import { useQuery } from "@tanstack/react-query";

const useSearch = (params: SearchParams) => useQuery({
  queryKey: ["search", params.search_type?.join("-")],
  queryFn: async () => callService(searchSearch, { body: params })
});


export default useSearch;