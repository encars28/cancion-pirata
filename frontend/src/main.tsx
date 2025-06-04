import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { FetchError, handleFetchError, showError, showSuccess } from "./utils.ts";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.log("Error during query:  ", error.message);
      if (
        error instanceof FetchError &&
        !(
          query.queryKey.includes("search") ||
          query.queryKey.includes("profilePicture")
        )
      ) {
        handleFetchError(error);
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      console.log("Error during mutation: ", error.message);
      if (error instanceof FetchError) {
        handleFetchError(error);
        showError(error.message);
      } else {
        showError(error as any);
      }
    },
    onSuccess: () => {
      showSuccess();
    },
  }),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
