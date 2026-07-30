import { SharedResourceCard } from '@repo/ui/components/media/ResourceCard';
import type React from 'react';
import type { ResourceType } from '@repo/library/types';

interface LibraryResourceCardProps {
  title: string;
  description?: string;
  type: ResourceType;
  isPublic?: boolean;
  onPress: () => void;
  href?: string;
  onaddToDesk?: () => void;
  onLike?: () => void;
  isLiked?: boolean;
}

/**
 * LibraryResourceCard - Wrapper for shared ResourceCard.
 */
export const LibraryResourceCard: React.FC<LibraryResourceCardProps> = (props) => {
  return (
    <SharedResourceCard {...props} onAddToDesk={props.isPublic ? props.onaddToDesk : undefined} />
  );
};

export default LibraryResourceCard;
