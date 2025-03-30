import { AdminTabs } from "../components/AdminTabs/AdminTabs";
import { Shell } from "../components/Shell/Shell";
import { Outlet, useLocation } from "react-router";

export function AdminPage() {
  const location = useLocation();

  let tabsDefault;
  switch (location.pathname) {
    case '/admin/users':
      tabsDefault = 'usuarios';
      break;
    case '/admin/authors':
      tabsDefault = 'autores';
      break;
    case '/admin/poems':
      tabsDefault = 'poemas';
      break;
    default:
      tabsDefault = 'usuarios';
  }

  return (
    <Shell>
      <AdminTabs tabsDefault={tabsDefault} />
      <Outlet />
    </Shell >
  );
}