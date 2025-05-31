import { useParams } from "react-router";
import { Shell } from "../components/Shell/Shell";
import { useQuery } from "@tanstack/react-query";
import { callService, handleError } from "../utils";
import { UserPublic, usersReadUserById } from "../client";
import { Loading } from "../components/Loading";
import { ShowUser } from "../components/User/ShowUser";

export function UserPage() {
  const params = useParams();
  const userId = params.id;

  const { data, error, isPending, isError } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () =>
      callService(usersReadUserById, { path: { user_id: userId! } }),
    placeholderData: (prevData) => prevData,
  });

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    handleError(error as any);
  }

  const user: UserPublic = data!;

  return (
    <Shell>
      <ShowUser user={user} />
    </Shell>
  );
}
