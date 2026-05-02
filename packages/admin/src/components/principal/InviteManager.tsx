import { api } from "@repo/core/api";
import {
	coreRuntime,
	handleAPIError,
	type PrincipalInviteRole as UserRole,
} from "@repo/core/logic";
import type { InviteCode } from "@repo/core/types";
import { QRBuilder, QRCodeGenerator } from "@repo/scanner-kit";
import { ArrowLeft, Copy, Plus, QrCode, Shield, Users } from "@repo/ui/icons";
import {
	Box,
	Button,
	ButtonText,
	Heading,
	HStack,
	Icon,
	Modal,
	ModalBackdrop,
	ModalBody,
	ModalContent,
	ModalHeader,
	Heading as ModalHeading,
	Pressable,
	ScrollView,
	Spinner,
	Text,
	VStack,
} from "@repo/ui/primitives";
import { useToast } from "@repo/ui/providers";
import { hapticLight } from "@repo/ui/utils/haptics";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface InviteManagerProps {
	schoolId: string;
	userId: string;
	onBack: () => void;
}
export default function InviteManager({
	schoolId,
	userId,
	onBack,
}: InviteManagerProps) {
	const { t } = useTranslation();
	const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const toast = useToast();
	const [qrCodeData, setQrCodeData] = useState<{
		code: string;
		role: string;
	} | null>(null);
	const loadInviteCodes = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const codes = await api.school.getInviteCodes(schoolId);
			setInviteCodes(codes);
		} catch (err: any) {
			const apiError = handleAPIError(err, true);
			setError(apiError.message);
		} finally {
			setIsLoading(false);
		}
	};
	useEffect(() => {
		loadInviteCodes();
	}, [loadInviteCodes]);
	const handleGenerateCode = async (role: UserRole) => {
		setIsGenerating(true);
		setError(null);
		try {
			hapticLight();
			await api.school.generateInviteCode(schoolId, role, userId);
			await loadInviteCodes();
		} catch (err: any) {
			const apiError = handleAPIError(err, true);
			setError(apiError.message);
		} finally {
			setIsGenerating(false);
		}
	};
	const handleCopyCode = async (code: string) => {
		try {
			hapticLight();
			await coreRuntime.clipboard.setStringAsync(code);
			toast.showToast({
				message: t("principal.invites.copied") || "Copied to Clipboard",
				type: "success",
			});
		} catch (err) {
			handleAPIError(err);
		}
	};
	const getRoleConfig = (role: string) => {
		switch (role) {
			case "teacher":
				return {
					color: "text-phase-interactive",
					bg: "bg-phase-interactive/10",
					label: "Faculty",
				};
			case "student":
				return {
					color: "text-phase-interactive",
					bg: "bg-phase-interactive/10",
					label: "Scholar",
				};
			case "principal":
				return {
					color: "text-phase-interactive",
					bg: "bg-phase-interactive/10",
					label: "Executive",
				};
			case "sectionHead":
				return {
					color: "text-phase-interactive",
					bg: "bg-phase-interactive/10",
					label: "Admin",
				};
			case "gradeHead":
				return {
					color: "text-phase-interactive",
					bg: "bg-phase-interactive/10",
					label: "Admin",
				};
			default:
				return {
					color: "text-phaseText-muted",
					bg: "bg-phase-canvas",
					label: "User",
				};
		}
	};
	return (
		<Box className="flex-1 bg-phase-canvas">
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 100 }}
			>
				<VStack className="gap-10 p-6">
					{/* Header */}
					<VStack className="gap-6">
						<Pressable onPress={onBack}>
							<HStack className="items-center gap-2 bg-phase-surface px-4 py-2 rounded-full border border-phase-border self-start shadow-sm active:scale-95 transition-all">
								<Icon
									as={ArrowLeft}
									size="xs"
									className="text-phaseText-primary"
								/>
								<Text className="text-[12px] font-black text-phaseText-primary uppercase tracking-widest">
									Back
								</Text>
							</HStack>
						</Pressable>

						<VStack className="gap-1.5">
							<Heading className="text-[32px] font-black text-phaseText-primary tracking-tight">
								{t("principal.invites.title", "Invite Codes")}
							</Heading>
							<Text className="text-[13px] font-bold text-phaseText-muted uppercase tracking-[2px] leading-relaxed">
								{t(
									"principal.invites.description",
									"Institutional Growth Gates",
								)}
							</Text>
						</VStack>
					</VStack>

					{/* Generate Actions */}
					<VStack className="gap-4">
						<Button
							onPress={() => handleGenerateCode("principal")}
							isDisabled={isGenerating}
							className="bg-phase-interactive h-16 rounded-[24px] shadow-md border-none"
						>
							<HStack className="w-full items-center justify-between px-2">
								<HStack className="items-center gap-3">
									<Box className="w-10 h-10 rounded-xl bg-white/10 items-center justify-center">
										<Icon as={Shield} className="text-white" size="xs" />
									</Box>
									<ButtonText className="text-white font-black uppercase tracking-widest text-[11px]">
										{isGenerating ? "Engaging..." : "Authorize Executive"}
									</ButtonText>
								</HStack>
								<Icon as={Plus} size="xs" className="text-white" />
							</HStack>
						</Button>

						<HStack className="gap-4">
							<Button
								onPress={() => handleGenerateCode("teacher")}
								isDisabled={isGenerating}
								className="flex-1 bg-phase-surface h-16 rounded-[24px] border border-phase-border shadow-sm"
							>
								<ButtonText className="text-phaseText-primary font-black uppercase tracking-widest text-[11px]">
									+ Faculty
								</ButtonText>
							</Button>
							<Button
								onPress={() => handleGenerateCode("student")}
								isDisabled={isGenerating}
								className="flex-1 bg-phase-surface h-16 rounded-[24px] border border-phase-border shadow-sm"
							>
								<ButtonText className="text-phaseText-primary font-black uppercase tracking-widest text-[11px]">
									+ Scholar
								</ButtonText>
							</Button>
						</HStack>

						<HStack className="gap-4">
							<Button
								variant="outline"
								onPress={() => handleGenerateCode("sectionHead")}
								isDisabled={isGenerating}
								className="flex-1 bg-phase-canvas h-14 rounded-[20px] border-phase-border"
							>
								<ButtonText className="text-phaseText-secondary font-black uppercase tracking-widest text-[10px]">
									Section Head
								</ButtonText>
							</Button>
							<Button
								variant="outline"
								onPress={() => handleGenerateCode("gradeHead")}
								isDisabled={isGenerating}
								className="flex-1 bg-phase-canvas h-14 rounded-[20px] border-phase-border"
							>
								<ButtonText className="text-phaseText-secondary font-black uppercase tracking-widest text-[10px]">
									Grade Head
								</ButtonText>
							</Button>
						</HStack>
					</VStack>

					{/* Error Handle */}
					{error && (
						<Box className="p-5 bg-phase-danger/5 rounded-[24px] border border-phase-danger/20">
							<Text className="text-phase-danger font-black text-[13px] tracking-tight">
								{error}
							</Text>
						</Box>
					)}

					{/* Active Codes */}
					<VStack className="gap-6">
						<HStack className="justify-between items-end px-1">
							<VStack className="gap-1">
								<Heading className="text-[18px] font-black text-phaseText-primary tracking-tight">
									{t("principal.invites.activeCodesTitle", "Active Keys")}
								</Heading>
								<Text className="text-[10px] font-bold text-phaseText-muted uppercase tracking-widest">
									Awaiting Identity
								</Text>
							</VStack>
							{isLoading && <Spinner className="text-phase-interactive" />}
						</HStack>

						{inviteCodes.length === 0 && !isLoading ? (
							<Box className="p-16 items-center justify-center bg-phase-surface rounded-[40px] border border-dashed border-phase-border shadow-inner">
								<Icon
									as={Users}
									size="xl"
									className="text-phaseText-muted/10 mb-6"
								/>
								<Text className="text-center font-bold text-phaseText-muted italic opacity-60">
									No institutional keys active.
								</Text>
							</Box>
						) : (
							<VStack className="gap-5">
								{inviteCodes.map((invite) => {
									const config = getRoleConfig(invite.role);
									return (
										<Box
											key={invite.code}
											className="bg-phase-surface p-6 rounded-[32px] border border-phase-border flex-row items-center shadow-sm"
										>
											<VStack className="flex-1 gap-3">
												<HStack className="items-center gap-3">
													<Text className="text-2xl font-black text-phase-interactive italic tracking-widest font-mono">
														{invite.code}
													</Text>
													<Box
														className={`px-2.5 py-1 rounded-lg ${config.bg} border border-phase-interactive/20`}
													>
														<Text
															className={`text-[9px] font-black uppercase tracking-widest ${config.color}`}
														>
															{config.label}
														</Text>
													</Box>
												</HStack>

												<HStack className="gap-3 items-center">
													<Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-widest opacity-60">
														Issued:{" "}
														{new Date(invite.created_at).toLocaleDateString(
															undefined,
															{
																month: "short",
																day: "numeric",
															},
														)}
													</Text>
													<Box
														className={`w-1.5 h-1.5 rounded-full ${invite.used ? "bg-phaseText-muted/20" : "bg-phase-success"}`}
													/>
													<Text
														className={`text-[10px] font-black uppercase tracking-widest ${invite.used ? "text-phaseText-muted/40" : "text-phase-success"}`}
													>
														{invite.used ? "Redeemed" : "Ready"}
													</Text>
												</HStack>
											</VStack>

											<HStack className="gap-3">
												<Pressable
													onPress={() => handleCopyCode(invite.code)}
													className="w-12 h-12 rounded-[18px] bg-phase-canvas items-center justify-center border border-phase-border active:scale-90 transition-all"
												>
													<Icon
														as={Copy}
														size="xs"
														className="text-phaseText-muted"
													/>
												</Pressable>
												<Pressable
													onPress={() => {
														hapticLight();
														setQrCodeData({
															code: invite.code,
															role: invite.role,
														});
													}}
													className="w-12 h-12 rounded-[18px] bg-phase-interactive items-center justify-center shadow-md active:scale-95 transition-all"
												>
													<Icon as={QrCode} size="xs" className="text-white" />
												</Pressable>
											</HStack>
										</Box>
									);
								})}
							</VStack>
						)}
					</VStack>
				</VStack>
			</ScrollView>

			{/* QR Modal */}
			<Modal isOpen={qrCodeData !== null} onClose={() => setQrCodeData(null)}>
				<ModalBackdrop />
				<ModalContent className="bg-phase-surface rounded-[40px] p-6 items-center border border-phase-border shadow-2xl">
					<ModalHeader className="mb-8 w-full">
						<VStack className="items-center gap-1.5 w-full">
							<ModalHeading className="text-[20px] font-black text-phaseText-primary uppercase tracking-wider text-center">
								Identity Gate
							</ModalHeading>
							{qrCodeData && (
								<Text className="text-[11px] font-bold text-phaseText-muted uppercase tracking-[2px]">
									{qrCodeData.role} • IDENTITY VERIFIED
								</Text>
							)}
						</VStack>
					</ModalHeader>
					<ModalBody className="items-center gap-8 px-4 pb-8">
						{qrCodeData && (
							<VStack className="items-center gap-8">
								<Box className="p-8 bg-phase-canvas rounded-[40px] border border-phase-border shadow-inner">
									<QRCodeGenerator
										value={QRBuilder.invite(
											qrCodeData.code,
											schoolId,
											qrCodeData.role,
										)}
										size={220}
										color="#000000"
										backgroundColor="transparent"
										label={qrCodeData.code}
										errorCorrectionLevel="H"
										borderRadius={24}
										padding={0}
									/>
								</Box>
								<VStack className="items-center gap-2">
									<Text className="text-[28px] font-mono font-black text-phase-interactive tracking-[4px] italic">
										{qrCodeData.code}
									</Text>
									<Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-[3px] opacity-60">
										Scan to establish authority
									</Text>
								</VStack>
							</VStack>
						)}
					</ModalBody>
					<Button
						onPress={() => setQrCodeData(null)}
						className="w-full h-14 rounded-[20px] bg-phase-canvas border border-phase-border"
					>
						<ButtonText className="text-phaseText-primary font-black uppercase text-[11px] tracking-widest">
							Close Gate
						</ButtonText>
					</Button>
				</ModalContent>
			</Modal>
		</Box>
	);
}
