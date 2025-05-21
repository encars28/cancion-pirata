import usePoem from "../../../hooks/usePoem"
import { Loading } from "../../Loading"
import { handleError } from "../../../utils"
import { useNavigate, useParams } from "react-router"
import { PoemPublicWithAllTheInfo } from "../../../client/types.gen"
import { EditPoemForm } from "./EditPoemForm"

export function EditPoem() {
  const navigate = useNavigate()
  const params = useParams();
  const poemId = params.id;
  const { data, error, isError, isPending } = usePoem(poemId!)
  if (isPending) {
    return <Loading />
  }
  if (isError) {
    navigate("/poems")
    handleError(error as any)
  }

  const poem: PoemPublicWithAllTheInfo = data!;

  return (
    <EditPoemForm poem={poem} />
  )
}