import { Avatar } from "@mantine/core";
import usePicture from "../../hooks/usePicture";

export function ProfileAvatar({...props}) {
  const { profilePicture } = usePicture();
  return profilePicture ? (
    <Avatar
      src={URL.createObjectURL(profilePicture as Blob)}
      alt="Perfil"
      {...props}
    />
  ) : (
    <Avatar
      alt="Perfil"
      {...props}
    />
  );
}
