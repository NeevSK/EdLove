import { DeepLinkType } from '@repo/core/logic';
import { normalizeAcceptedDeepLink } from '@/lib/deepLinks/urlPolicy';

type DeepLinkResult = {
  isHandled: boolean;
  params: Record<string, string>;
  type: DeepLinkType;
};

type DeepLinkDispatchDependencies = {
  handleURL: (url: string) => Promise<DeepLinkResult>;
  navigateToClassroomInvite: (inviteCode: string) => void;
  track: (url: string, type: DeepLinkType, params: Record<string, string>) => void;
};

export async function dispatchDeepLink(
  url: string,
  { handleURL, navigateToClassroomInvite, track }: DeepLinkDispatchDependencies,
): Promise<boolean> {
  const acceptedURL = normalizeAcceptedDeepLink(url);
  if (!acceptedURL) return false;

  const result = await handleURL(acceptedURL);
  track(acceptedURL, result.type, result.params);
  if (!result.isHandled && result.type === DeepLinkType.CLASSROOM_INVITE) {
    const inviteCode = result.params.inviteCode;
    if (inviteCode) navigateToClassroomInvite(inviteCode);
  }
  return true;
}
