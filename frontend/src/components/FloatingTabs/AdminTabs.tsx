import { useState } from 'react';
import { FloatingIndicator, Tabs } from '@mantine/core';
import classes from './AdminTabs.module.css';
import {useNavigate} from 'react-router';

export function AdminTabs({tabsDefault}: {tabsDefault: string}) {
  const navigator = useNavigate();
  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
  const [value, setValue] = useState<string | null>(tabsDefault);
  const [controlsRefs, setControlsRefs] = useState<Record<string, HTMLButtonElement | null>>({});
  const setControlRef = (val: string) => (node: HTMLButtonElement) => {
    controlsRefs[val] = node;
    setControlsRefs(controlsRefs);
  };

  return (
    <Tabs 
      variant="none" 
      value={value} 
      onChange={setValue}
      m="xl"
    >
      <Tabs.List ref={setRootRef} className={classes.list} grow>
        <Tabs.Tab 
          className={classes.tab} 
          value="usuarios" 
          ref={setControlRef('usuarios')}
          onClick={() => navigator('/admin/users')}
        >
          Usuarios
        </Tabs.Tab>
        <Tabs.Tab 
          className={classes.tab} 
          value="autores" 
          ref={setControlRef('autores')}
          onClick={() => navigator('/admin/authors')}
        >
          Autores
        </Tabs.Tab>
        <Tabs.Tab 
          className={classes.tab} 
          value="poemas" 
          ref={setControlRef('poemas')}
          onClick={() => navigator('/admin/poems')}
        >
          Poemas
        </Tabs.Tab>

        <FloatingIndicator
          target={value ? controlsRefs[value] : null}
          parent={rootRef}
          className={classes.indicator}
        />
      </Tabs.List>
    </Tabs>
  );
}