import { Navigate, useParams } from "react-router";
import { Shell } from "../components/Shell/Shell";
import useAuthor from "../hooks/useAuthor";
import { Loading } from "../components/Loading";
import { showError } from "../utils";
import { AuthorPublicWithPoems } from "../client";
import { ShowAuthor } from "../components/Author/ShowAuthor";

export function AuthorPage() {
  const params = useParams()
  const authorId = params.id;

  const { data, error, isPending, isError} = useAuthor(authorId!);

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    showError(error as any);
  }

  const author: AuthorPublicWithPoems = data!;

  if (author.user_id) {
    return <Navigate to={`/users/${author.user_id}`} replace />;
  }

  return (
    <Shell>
      <ShowAuthor author={author} />
    </Shell>
  );
}
