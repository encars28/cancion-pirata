import useUserActions from "../../hooks/useUserActions";
import { Avatar } from "@mantine/core";

export function ProfileAvatar({...props}) {
  const { profilePicture } = useUserActions();
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
