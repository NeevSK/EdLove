// @repo/ui/src/native-menu/index.tsx
import React from 'react';
import * as ContextMenu from 'zeego/context-menu';
import * as DropdownMenu from 'zeego/dropdown-menu';

export interface ZeegoMenuItemProps {
  id: string;
  label: string;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export interface ZeegoContextMenuProps {
  title?: string;
  items: ZeegoMenuItemProps[];
  children: React.ReactNode;
}

/**
 * Zeego Native Context Menu Wrapper
 * Connects directly to native iOS UIContextMenuConfiguration and Android PopupMenu via zeego.
 */
export function NativeContextMenu({ title, items, children }: ZeegoContextMenuProps) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>{children}</ContextMenu.Trigger>

      <ContextMenu.Content>
        {title && (
          <ContextMenu.Label>{title}</ContextMenu.Label>
        )}
        {items.map((item) => (
          <ContextMenu.Item
            key={item.id}
            onSelect={item.onSelect}
            destructive={item.destructive}
            disabled={item.disabled}
          >
            <ContextMenu.ItemTitle>{item.label}</ContextMenu.ItemTitle>
          </ContextMenu.Item>
        ))}
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

/**
 * Zeego Native Dropdown Menu Wrapper
 */
export function NativeDropdownMenu({ title, items, children }: ZeegoContextMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>{children}</DropdownMenu.Trigger>

      <DropdownMenu.Content>
        {title && (
          <DropdownMenu.Label>{title}</DropdownMenu.Label>
        )}
        {items.map((item) => (
          <DropdownMenu.Item
            key={item.id}
            onSelect={item.onSelect}
            destructive={item.destructive}
            disabled={item.disabled}
          >
            <DropdownMenu.ItemTitle>{item.label}</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
