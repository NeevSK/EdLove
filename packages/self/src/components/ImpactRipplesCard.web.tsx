/**
 * ImpactRipplesCard.web.tsx
 *
 * Web-specific implementation of the Impact Ripples card.
 * Purged raw HTML fragments and malformed inline styles in favor of @repo/ui primitives and Sanctuary design tokens.
 */

import type { ImpactRipple } from "@repo/core/api";
import { Box, Icon, Text, VStack } from "@repo/ui/primitives";
import { Waves } from "lucide-react-native";

interface ImpactRipplesCardProps {
	ripples: ImpactRipple[];
}

export default function ImpactRipplesCard({ ripples }: ImpactRipplesCardProps) {
	if (!ripples.length) return null;

	return (
		<Box className="p-6 bg-indigo-400/5 rounded-comfortable border border-indigo-400/10 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
			{/* Header */}
			<VStack className="gap-1 mb-4">
				<Text className="text-[10px] font-black uppercase tracking-[2px] text-indigo-400">
					💧 IMPACT RIPPLES
				</Text>
				<Text className="text-xs text-mistGray italic">
					The subtle effects of your positive choices.
				</Text>
			</VStack>

			<VStack className="gap-3">
				{ripples.map((r) => (
					<Box
						key={r.id}
						className="p-4 bg-indigo-400/5 rounded-xl border border-indigo-400/10 hover:border-indigo-400/20 transition-all duration-300"
					>
						<VStack className="gap-2">
							<Box className="flex-row items-center gap-2">
								<Icon as={Waves} size={12} className="text-indigo-400" />
								<Text className="text-xs font-bold text-sacredWhite/80">
									Positive Momentum
								</Text>
							</Box>
							<Text className="text-sm leading-relaxed text-sacredWhite/70 italic">
								"{r.warm_message_en ?? r.ripple_type}"
							</Text>
						</VStack>
					</Box>
				))}
			</VStack>
		</Box>
	);
}
