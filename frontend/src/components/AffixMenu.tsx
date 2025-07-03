import { ActionIcon, Menu } from "@mantine/core";
import { TbBookmarks, TbDots, TbEdit, TbTrash } from "react-icons/tb";

interface AffixMenuProps {
  deletePoem?: () => string;
  addPoemToCollectionModal: () => string;
  editPoem?: () => void;
  admin?: boolean;
}

export function AffixMenu({
  deletePoem,
  addPoemToCollectionModal,
  editPoem,
  admin = false,
}: AffixMenuProps) {
  return (
    <Menu position="top" transitionProps={{ transition: "pop" }} withArrow>
      <Menu.Target>
        <ActionIcon
          variant="light"
          style={{ backgroundColor: "#d0ebff" }}
          size="lg"
          radius="xl"
        >
          <TbDots size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<TbBookmarks size={16} />}
          onClick={addPoemToCollectionModal}
        >
          Añadir a colección
        </Menu.Item>
        {admin && (
          <>
            <Menu.Item leftSection={<TbEdit size={16} />} onClick={editPoem}>
              Editar poema
            </Menu.Item>
            <Menu.Item
              leftSection={<TbTrash size={16} />}
              color="red"
              onClick={deletePoem}
            >
              Eliminar poema
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
