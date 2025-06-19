import { Avatar, AvatarProps } from "@mantine/core";

interface PersonAvatarProps extends AvatarProps {
  picture?: Blob;
}

export function PersonAvatar({picture, ...props}: PersonAvatarProps) {
  return picture ? (
    <Avatar
      src={URL.createObjectURL(picture)}
      alt="Foto"
      {...props}
    />
  ) : (
    <Avatar
      alt="Foto"
      {...props}
    />
  );
}
