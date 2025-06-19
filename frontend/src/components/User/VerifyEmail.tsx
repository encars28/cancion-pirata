import { Navigate, useSearchParams } from "react-router";
import { EmailToken } from "../../client";
import { Loading } from "../Loading";
import { useEffect } from "react";
import useUserMe from "../../hooks/useUserMe";

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { verifyEmailMutation } = useUserMe();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    async function verify() {
      await verifyEmailMutation.mutateAsync({ token: token } as EmailToken);
    }

    try {
      verify();
    } catch {}

  }, [token]);

  if (verifyEmailMutation.isPending) {
    return <Loading />;
  }

  return <Navigate to="/" replace />;
}
