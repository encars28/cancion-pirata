import { Navigate, useSearchParams } from "react-router";
import useAuth from "../../hooks/useAuth";
import { VerifyToken } from "../../client";
import { Loading } from "../Loading";
import { useEffect } from "react";

export function VerifyAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { activateAccountMutation: activateAccount } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    async function verify() {
      await activateAccount.mutateAsync({ token: token } as VerifyToken);
    }

    try {
      verify();
    } catch {}

  }, [token]);

  if (activateAccount.isPending) {
    return <Loading />;
  }

  return <Navigate to="/login" replace />;
}
