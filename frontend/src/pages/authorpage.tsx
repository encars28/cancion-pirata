import { Navigate, useParams } from "react-router";
import { Shell } from "../components/Shell/Shell";
import useAuthor from "../hooks/useAuthor";
import { Loading } from "../components/Loading";
import { AuthorPublicWithPoems } from "../client";
import { ShowAuthor } from "../components/Author/ShowAuthor";
import { notifications } from "@mantine/notifications";
import { errorNotification } from "../notifications";
import { FetchError } from "../utils";
import { QueryError } from "../components/Error/QueryError";
import { isLoggedIn } from "../hooks/useAuth";
import { Affix, ActionIcon, Tooltip } from "@mantine/core";
import { TbWritingSign } from "react-icons/tb";
import { useNavigate } from "react-router";

export function AuthorPage() {
  const params = useParams()
  const authorId = params.id;
  const navigate = useNavigate();

  const { data, error, isPending, isError} = useAuthor(authorId!);

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    notifications.show(errorNotification({
      title: "Error al cargar el autor", description: error.message || "No se pudo cargar el autor."}))
    
    if (error instanceof FetchError) {
      return <QueryError status={error.res.status} />;
    }

    return <Navigate to="/" replace />;
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
