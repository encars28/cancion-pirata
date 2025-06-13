import { Group, Overlay, Text } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { TbPencil } from "react-icons/tb";
import classes from "./UploadAuthorPicture.module.css";
import { useHover } from "@mantine/hooks";
import useAuthorActions from "../../../hooks/useAuthorActions";
import { AuthorAvatar } from "../AuthorAvatar";
import { notifications } from "@mantine/notifications";
import { errorNotification } from "../../Notifications/notifications";

export function UploadAuthorPicture({authorId}: { authorId: string }) {
  const { updateProfilePicture } = useAuthorActions(authorId);
  const { hovered, ref } = useHover();

  const handleSubmit = async (picture: File | null) => {
    if (picture) {
      try {
        await updateProfilePicture.mutateAsync(picture);
      } catch {}
    }
  };

  console.log(hovered);
  return (
    <div ref={ref} className={classes.container}>
      <Dropzone
        onDrop={(files) => handleSubmit(files[0])}
        onReject={() => notifications.show(errorNotification({title: "Error al subir la imagen", description: "Formato de archivo no permitido o archivo mayor a 5MB"}))}
        maxSize={5 * 1024 ** 2}
        accept={IMAGE_MIME_TYPE}
        multiple={false}
        className={classes.root}
        loading={updateProfilePicture.isPending}
        loaderProps={{type: "dots"}}
      >
        <AuthorAvatar authorId={authorId} className={classes.picture}/>
        <>
          <Dropzone.Accept>
            <Overlay className={classes.overlay_accept} opacity={0.5} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <Overlay className={classes.overlay_reject} opacity={0.5} />
          </Dropzone.Reject>{" "}
        </>
        {hovered && (
          <Dropzone.Idle>
            <Overlay className={classes.overlay} opacity={0.7}>
              <Group gap="xs">
                <TbPencil color="white" size={25} />
                <Text className={classes.text}>Foto</Text>
              </Group>
            </Overlay>
          </Dropzone.Idle>
        )}
      </Dropzone>
    </div>
  );
}
