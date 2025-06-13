import usePoem from "../../../hooks/usePoem"
import { Loading } from "../../Loading"
import { useNavigate, useParams } from "react-router"
import { PoemPublicWithAllTheInfo } from "../../../client/types.gen"
import { EditPoemForm } from "./EditPoemForm"
import { notifications } from "@mantine/notifications"
import { errorNotification } from "../../../notifications"

export function EditPoem() {
  const navigate = useNavigate()
  const params = useParams();
  const poemId = params.id;
  const { data, error, isError, isPending } = usePoem(poemId!, false)
  if (isPending) {
    return <Loading />
  }
  if (isError) {
    navigate("/poems")
    notifications.show(errorNotification({title: "Error cargando el poema", description: error.message}))
  }

  const poem: PoemPublicWithAllTheInfo = data!;
  console.log(poem)

  return (
    <EditPoemForm poem={poem} />
  )
}