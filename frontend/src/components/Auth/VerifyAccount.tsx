import { Navigate, useSearchParams } from "react-router";
import useAuth from "../../hooks/useAuth";
import { VerifyToken } from "../../client";
import { Loading } from "../Loading";

export function VerifyAccount() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token");
  const { activateAccountMutation: activateAccount } = useAuth()

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  activateAccount.mutate({ token } as VerifyToken);
  if (activateAccount.isPending) {
    return <Loading />
  }

  return <Navigate to="/login" replace />;
}