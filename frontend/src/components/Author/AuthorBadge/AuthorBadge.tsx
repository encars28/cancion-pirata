import { Badge, BadgeProps } from "@mantine/core";
import { TbUser } from "react-icons/tb";
import classes from "./AuthorBadge.module.css";
import { useNavigate } from "react-router";

export function AuthorBadge({
  authorId,
  authorName,
  ...props
}: {
  authorId: string;
  authorName: string;
} & Partial<BadgeProps>) {
  const navigate = useNavigate();

  return (
    <Badge
      onClick={() => navigate(`/authors/${authorId}`)}
      size="lg"
      className={classes.link}
      {...props}
    >
      <TbUser />
      {" " + authorName}
    </Badge>
  );
}
