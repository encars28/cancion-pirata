import { Navigate, useParams } from "react-router";
import { Shell } from "../components/Shell/Shell";
import useAuthor from "../hooks/useAuthor";
import { Loading } from "../components/Loading";
import { AuthorPublicWithPoems } from "../client";
import { ShowAuthor } from "../components/Author/ShowAuthor";
import { notifications } from "@mantine/notifications";
import { errorNotification } from "../notifications";

export function AuthorPage() {
  const params = useParams()
  const authorId = params.id;

  const { data, error, isPending, isError} = useAuthor(authorId!);

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    notifications.show(errorNotification({
      title: "Error al cargar el autor", description: error.message || "No se pudo cargar el autor."}))
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
