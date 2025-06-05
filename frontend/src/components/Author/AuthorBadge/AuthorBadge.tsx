import { Badge } from "@mantine/core";
import { TbUser } from "react-icons/tb";
import classes from "./AuthorBadge.module.css";
import { useNavigate } from "react-router";

export function AuthorBadge({
  authorId,
  authorName,
}: {
  authorId: string;
  authorName: string;
}) {
  const navigate = useNavigate();

  return (
    <Badge
      onClick={() => navigate(`/authors/${authorId}`)}
      variant="default"
      size="lg"
      className={classes.link}
    >
      <TbUser />
      {" " + authorName}
    </Badge>
  );
}
