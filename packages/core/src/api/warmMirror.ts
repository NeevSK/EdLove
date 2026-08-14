/** Warm Mirror: server-owned personal data points plus pure narrative helpers. */
import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import type { WarmMirrorDataPoints } from '@repo/core/api/warmMirror.contract';

export type { WarmMirrorDataPoints };

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export const warmMirrorAPI = {
  async getDataPoints(userId: string, since?: string): Promise<WarmMirrorDataPoints> {
    const response = await (client.api as any).warmMirror[':userId'].$get({
      param: { userId },
      query: since ? { since } : {},
    });
    if (!response.ok) throw new Error('Failed to fetch warm mirror data.');
    return (await response.json()) as WarmMirrorDataPoints;
  },

  generateNarrativeEn(data: WarmMirrorDataPoints): string {
    const lines = ['This past week in your sanctuary:'];
    if (data.days_present === 0) {
      return [
        ...lines,
        'This week was a quiet one.',
        'The sanctuary is here when you return.',
        'Rest is part of the rhythm.',
      ].join('\n');
    }
    if (data.days_present === 1)
      lines.push('You found your way here once this week. That still counts.');
    else if (data.days_present <= 3) lines.push(`You were present on ${data.days_present} days.`);
    else lines.push(`You showed up on ${data.days_present} days — including the harder ones.`);
    if (data.quiet_moments >= 3)
      lines.push('You made space for yourself more than once. That takes intention.');
    else if (data.quiet_moments === 1) lines.push('You made space for yourself at least once.');
    if (data.ripples_received >= 3)
      lines.push(
        `Your work reached people — ${data.ripples_received} quiet echoes came back to you this week.`,
      );
    else if (data.ripples_received === 1) lines.push('Your work touched someone this week.');
    if (data.resources_that_reached_others > 0)
      lines.push(
        `${data.resources_that_reached_others === 1 ? 'Something' : `${data.resources_that_reached_others} things`} you created found their way to another person.`,
      );
    if (data.assignments_with_feedback > 0)
      lines.push(
        `You wrote careful feedback for ${data.assignments_with_feedback} ${data.assignments_with_feedback === 1 ? 'student' : 'students'}. They received more than a mark.`,
      );
    if (data.posts_that_sparked > 0) lines.push('A question you raised opened a conversation.');
    if (data.days_since_joined >= 30 && data.primary_classroom_name) {
      const months = Math.floor(data.days_since_joined / 30);
      lines.push(
        `${data.primary_classroom_name} has been your classroom for ${months} ${months === 1 ? 'month' : 'months'} now.`,
      );
    }
    lines.push('You showed up. That is not a small thing.');
    return lines.join('\n');
  },

  generateNarrativeSi(data: WarmMirrorDataPoints): string {
    const lines = ['ඔබේ ශාලාවේ පසුගිය සතිය:'];
    if (data.days_present === 0)
      return [...lines, 'මෙය නිහඬ සතියක් විය.', 'ඔබ නැවත එන විට ශාලාව මෙහි ඇත.', 'විවේකයද ගමනේ කොටසකි.'].join(
        '\n',
      );
    lines.push(
      data.days_present === 1
        ? 'ඔබ මේ සතියේ එක් වරක් මෙහි පැමිණියා. එයද වැදගත්ය.'
        : `ඔබ දින ${data.days_present}ක් මෙහි සිටියා.`,
    );
    if (data.quiet_moments > 0) lines.push('ඔබ ඔබ වෙනුවෙන් ඉඩක් සාදා ගත්තා.');
    if (data.ripples_received > 0) lines.push('ඔබේ කාර්යයේ උණුසුම නැවත ඔබ වෙත පැමිණියා.');
    if (data.assignments_with_feedback > 0)
      lines.push(`ඔබ සිසුන් ${data.assignments_with_feedback} දෙනෙකුට ප්‍රතිචාර ලබා දුන්නා.`);
    lines.push('ඔබ පැමිණියා. එය සුළු දෙයක් නොවේ.');
    return lines.join('\n');
  },
};
