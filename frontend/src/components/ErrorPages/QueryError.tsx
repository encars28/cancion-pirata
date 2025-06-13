import { Navigate } from "react-router";
import { NothingFound } from "./NothingFound";
import { ServerError } from "./ServerError";

interface ErrorProps {
  status: number;
  path?: string;
}

export function QueryError({ status, path = "/" }: ErrorProps) {
  switch (status) {
    case 404: 
      return <NothingFound />
    case 500:
      return <ServerError />
    default: 
      return <Navigate to={path} replace={true} />
  }
}