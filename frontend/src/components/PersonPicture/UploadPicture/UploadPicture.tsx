import { Group, Overlay, Text } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { TbPencil } from "react-icons/tb";
import classes from "./UploadPicture.module.css";
import { useHover } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { errorNotification } from "../../../notifications";
import { PersonAvatar } from "../PersonAvatar";
import { UseMutationResult } from "@tanstack/react-query";
import { Message } from "../../../client";

export function UploadPicture({
  updatePicture,
  url,
  small
}: {
  updatePicture: UseMutationResult<Message | undefined, Error, File, unknown>;
  url: string;
  small?: boolean;
}) {
  const { hovered, ref } = useHover();

  const handleSubmit = async (picture: File | null) => {
    if (picture) {
      try {
        await updatePicture.mutateAsync(picture);
      } catch {}
    }
  };

  return (
    <div ref={ref} className={small ? classes.container_small : classes.container}>
      <Dropzone
        onDrop={(files) => handleSubmit(files[0])}
        onReject={() =>
          notifications.show(
            errorNotification({
              title: "Error al subir la imagen",
              description:
                "Formato de archivo no permitido o archivo mayor a 5MB",
            })
          )
        }
        maxSize={5 * 1024 ** 2}
        accept={IMAGE_MIME_TYPE}
        multiple={false}
        className={classes.root}
        loading={updatePicture.isPending}
        loaderProps={{ type: "dots" }}
      >
        <PersonAvatar
          url={url}
          className={small ? classes.picture_small : classes.picture}
        />
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
