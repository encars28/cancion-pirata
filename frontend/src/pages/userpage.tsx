import { useParams } from "react-router";
import { Shell } from "../components/Shell/Shell";
import { useQuery } from "@tanstack/react-query";
import { callService, showError } from "../utils";
import { UserPublic, usersReadUserById } from "../client";
import { Loading } from "../components/Loading";
import { ShowUser } from "../components/User/ShowUser";
import { NothingFound } from "../components/ErrorPages/NothingFound";

export function UserPage() {
  const params = useParams();
  const userId = params.id;

  const { data, error, isPending, isError } = useQuery({
    queryKey: ["users", userId],
    queryFn: async () =>
      callService(usersReadUserById, { path: { user_id: userId! } }),
    placeholderData: (prevData) => prevData,
  });

  if (isPending) {
    return <Loading />;
  }

  // if (isError) {
  //   return <NothingFound />
  // }

  const user: UserPublic = data!;

  return (
    <Shell>
      <ShowUser user={user} />
    </Shell>
  );
}
