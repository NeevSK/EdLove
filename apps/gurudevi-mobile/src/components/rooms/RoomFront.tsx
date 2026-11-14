import type { FloorNode, RoomCatalog } from '@repo/core/logic/floor';
import { useRoomScroll, useScreenGround, useShellLayout } from '@repo/ui/components/native';
import { WorldEnter } from '@repo/ui/theme/native';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoomFloor } from '@/components/floor/RoomFloor';

export interface RoomFrontProps {
  /** The room's catalog as this bond's role sees it (roomCatalogOf). */
  catalog: RoomCatalog;
  userId: string | null | undefined;
  perspectiveId: string;
  renderPiece: (piece: FloorNode) => ReactNode;
  onSeeAll?: (groupId: string) => void;
  /** Above the floor: a greeting, a sample-data note. */
  lead?: ReactNode;
}

/**
 * A room's front on the phone: the world's ground at full presence, the
 * shell's gutters and scroll, an optional lead, then the shared room floor
 * (catalog features laid out by the floor engine).
 */
export function RoomFront({
  catalog,
  userId,
  perspectiveId,
  renderPiece,
  onSeeAll,
  lead,
}: RoomFrontProps) {
  useScreenGround('room');
  const scroll = useRoomScroll();
  const insets = useSafeAreaInsets();
  const shell = useShellLayout();

  return (
    <ScrollView
      {...scroll}
      style={styles.screen}
      contentContainerStyle={{
        paddingLeft: shell.gutter + shell.edges.left,
        paddingRight: shell.gutter + shell.edges.right,
        paddingTop: shell.stance === 'hud' ? shell.rhythm.top : 8,
        paddingBottom: insets.bottom + (shell.tabs === 'rail' ? 96 : 140),
        gap: shell.stance === 'hud' ? 20 : 28,
      }}
      showsVerticalScrollIndicator={false}
    >
      {lead ? <WorldEnter index={0}>{lead}</WorldEnter> : null}
      <WorldEnter index={1}>
        <RoomFloor
          catalog={catalog}
          userId={userId}
          perspectiveId={perspectiveId}
          renderPiece={renderPiece}
          onSeeAll={onSeeAll}
          inScroll
        />
      </WorldEnter>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: 'transparent' } });
