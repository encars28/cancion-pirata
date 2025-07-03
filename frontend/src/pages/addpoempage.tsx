import { AddPoem } from "../components/Poem/AddPoem";
import { Shell } from "../components/Shell/Shell";

export function BasePage() {
  return (
    <Shell>
      <AddPoem />
    </Shell>
  )
}