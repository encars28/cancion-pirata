import { Badge } from "@mantine/core";
import { TbUser } from "react-icons/tb";
import classes from "./AuthorBadge.module.css";
import { useNavigate } from "react-router";

export function AuthorBadge({
  authorId,
  authorName,
  variant = "default",
}: {
  authorId: string;
  authorName: string;
  variant?: "default" | "light" | "filled" | "outline";
}) {
  const navigate = useNavigate();

  return (
    <Badge
      onClick={() => navigate(`/authors/${authorId}`)}
      variant={variant}
      size="lg"
      className={classes.link}
    >
      <TbUser />
      {" " + authorName}
    </Badge>
  );
}
