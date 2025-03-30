import React, { useState } from 'react';
import { FloatingIndicator, Tabs } from '@mantine/core';
import classes from './FloatingTabs.module.css';

export function FloatingTabs<T extends {}>({ data, grow }: { data: T, grow?: boolean }) {
  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
  const [value, setValue] = useState<string | null>(Object.keys(data)[0]);
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
      <Tabs.List ref={setRootRef} className={classes.list} grow={grow}>
        {Object.keys(data).map((key) => (
          <Tabs.Tab 
            value={key} 
            ref={setControlRef(key)} 
            className={classes.tab}
          >
            {key}
          </Tabs.Tab>
        ))}

        <FloatingIndicator
          target={value ? controlsRefs[value] : null}
          parent={rootRef}
          className={classes.indicator}
        />
      </Tabs.List>

      {Object.entries(data).map(([key, value]) => (
        <Tabs.Panel value={key}>
          {value as React.ReactNode}
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}