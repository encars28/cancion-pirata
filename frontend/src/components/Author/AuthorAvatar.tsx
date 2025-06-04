import useAuthorActions from "../../hooks/useAuthorActions";
import { Avatar, AvatarProps } from "@mantine/core";

export function AuthorAvatar ({authorId, ...props}: {authorId: string} & Partial<AvatarProps>) {
  const { AuthorProfilePicture } = useAuthorActions(authorId);
  return AuthorProfilePicture ? (
    <Avatar
      src={URL.createObjectURL(AuthorProfilePicture as Blob)}
      alt="Autor"
      {...props}
    />
  ) : (
    <Avatar
      alt="Autor"
      {...props}
    />
  );
}
