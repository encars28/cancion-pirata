import useAuth from "../../hooks/useAuth";
import { Avatar } from "@mantine/core";

export function ProfileAvatar({...props}) {
  const { profilePicture } = useAuth();
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
