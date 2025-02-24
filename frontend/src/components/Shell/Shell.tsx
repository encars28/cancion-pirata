import { AppShell, Container, Group, RemoveScroll, Button, ActionIcon, rem } from '@mantine/core';
import classes from './Shell.module.css';
import { SearchControl, SearchMobileControl } from '../Search/SearchControl';

import { IconUser } from '@tabler/icons-react';

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <AppShell header={{ height: 60 }}>
      <AppShell.Header className={RemoveScroll.classNames.zeroRight}>
        <Container size="xl" px="md" className={classes.inner}>
          <a href="/" className={classes.link}>
            Tremendo Logo
          </a>

          <Group visibleFrom="sm">
            <SearchControl />
            <Button variant="outline" leftSection={<IconUser size={14} />}> 
              Login
            </Button>
          </Group>

          <Group hiddenFrom="sm" gap="md">
            <SearchMobileControl />
            <ActionIcon
              component="a"
              variant='outline'
              // href='/'
              size={rem(40)}
            >
              <IconUser stroke={1}/>
            </ActionIcon>
          </Group>

        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <div className={classes.main}>{children}</div>
      </AppShell.Main>
    </AppShell>
  );
}