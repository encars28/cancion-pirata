import { RequestResult } from "@hey-api/client-fetch";

export enum PoemType {
  TRANSLATION = 0,
  VERSION = 1,
}

export class FetchError extends Error {
  constructor(public res: Response, message?: string) {
    super(message);
  }
}

export function handleFetchError(error: FetchError) {
  if (error.res.status === 401 || error.res.status === 403) {
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  }

}

export async function callService<R, E, P = undefined>(
  service: P extends undefined ? () => RequestResult<R, E> : (params: P) => RequestResult<R, E>,
  ...args: (P extends undefined ? [] : [P])
): Promise<R> {
  const result = await (service as any)(args[0]);
  if (result.error) {
    let errorMessage: string
    if (Array.isArray(result.error.detail) && result.error.detail.length > 0) {
      errorMessage = result.error.detail[0].msg
    } else {
      errorMessage = result.error.detail
    }

    throw new FetchError(result.response, errorMessage || "An error occurred while calling the service.");
  }

  return result.data;
}
