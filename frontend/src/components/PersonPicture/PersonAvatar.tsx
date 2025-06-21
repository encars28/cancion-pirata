import { Avatar, AvatarProps } from "@mantine/core";

interface PersonAvatarProps extends AvatarProps {
  url: string;
  time?: number
}

export function PersonAvatar({ url, time, ...props }: PersonAvatarProps) {
  return <Avatar src={url} alt="Foto" {...props} />;
}
