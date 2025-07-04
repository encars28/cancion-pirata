import { Navigate, useParams } from "react-router";
import { Shell } from "../components/Shell/Shell";
import { useQuery } from "@tanstack/react-query";
import { callService, FetchError } from "../utils";
import { UserPublic, usersReadUserById } from "../client";
import { Loading } from "../components/Loading";
import { ShowUser } from "../components/User/ShowUser";
import { QueryError } from "../components/Error/QueryError";
import { notifications } from "@mantine/notifications";
import { errorNotification } from "../notifications";

export function UserPage() {
  const params = useParams();
  const userId = params.id;

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["users", userId],
    queryFn: async () =>
      callService(usersReadUserById, { path: { user_id: userId! } }),
    placeholderData: (prevData) => prevData,
  });

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    notifications.clean()
    notifications.show(errorNotification({
      title: "Error al cargar el usuario",
      description: error.message || "No se pudo cargar el usuario.",
    }))
    if (error instanceof FetchError) {
      return <QueryError status={error.res.status} />
    }

    return <Navigate to="/" replace />;
  }

  const user: UserPublic = data!;

  return (
    <Shell>
      <ShowUser user={user} />
    </Shell>
  );
}
