'use client';

import { Image, PanelsTopLeft, Settings2 } from 'lucide-react';
import { useRef } from 'react';
import styles from './floor-page-actions.module.css';

const floorLabels: Readonly<Record<string, string>> = {
  self: 'Self',
  workspace: 'Workspace',
  community: 'Community',
  library: 'Library',
};

type FloorPageActionsProps = Readonly<{
  domain: string;
  onChangeWallpaper: () => void;
  onOrganize: () => void;
}>;

export function FloorPageActions({ domain, onChangeWallpaper, onOrganize }: FloorPageActionsProps) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const label = floorLabels[domain] ?? 'this floor';

  function closeMenu() {
    if (menuRef.current) menuRef.current.open = false;
  }

  return (
    <details className={styles.actions} ref={menuRef}>
      <summary aria-label="Page settings" title="Page settings">
        <Settings2 aria-hidden="true" size={18} />
      </summary>
      <div className={styles.menu}>
        <button
          className={styles.menuItem}
          onClick={() => {
            closeMenu();
            onChangeWallpaper();
          }}
          type="button"
        >
          <Image aria-hidden="true" size={17} />
          <span>Appearance &amp; wallpaper</span>
        </button>
        <button
          className={styles.menuItem}
          onClick={() => {
            closeMenu();
            onOrganize();
          }}
          type="button"
        >
          <PanelsTopLeft aria-hidden="true" size={17} />
          <span>Organize {label}</span>
        </button>
      </div>
    </details>
  );
}
