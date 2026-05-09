import { identityAPI } from "@repo/core/api";
import { uploadToCloudinary } from "@repo/core/lib/cloudinary";
import {
	composerReducer,
	initialComposerState,
	usePermissions,
} from "@repo/core/logic";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useReducer } from "react";
import { communityAPI } from "../api/community";

interface PollData {
	options: { id: string; text: string }[];
	allow_multiple?: boolean;
	is_anonymous?: boolean;
	ends_at?: string | null;
}

export function useComposerLogic(groupId: string, onClose: () => void) {
	const [state, dispatch] = useReducer(composerReducer, initialComposerState);
	const { context } = usePermissions();
	const userCapacity =
		context.activeBond?.capacity ?? context.primaryCapacity ?? "guest";

	const pickImage = useCallback(async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.8,
		});
		if (!result.canceled && result.assets?.[0]?.uri) {
			dispatch({ type: "SET_IMAGE", payload: result.assets[0].uri });
		}
	}, []);

	const handleSubmit = useCallback(async () => {
		if (!state.content.trim() && !state.selectedImage) return;

		const myId = await identityAPI.getMyInternalId();
		if (!myId || !context.schoolId) return;

		dispatch({ type: "SET_SUBMITTING", payload: true });
		let mediaUrl = "";
		let mediaType: "image" | "document" | "audio" | "video" | undefined;

		try {
			if (state.selectedImage) {
				dispatch({ type: "SET_UPLOADING", payload: true });
				mediaUrl = await uploadToCloudinary(state.selectedImage, "image");
				mediaType = "image";
				dispatch({ type: "SET_UPLOADING", payload: false });
			}

			const endsAt =
				state.showCustomDate && state.pollCustomEndsAt
					? new Date(state.pollCustomEndsAt).toISOString()
					: state.pollDurationHours !== null
						? new Date(
								Date.now() + state.pollDurationHours * 60 * 60 * 1000,
							).toISOString()
						: null;

			const pollData: PollData | undefined = state.isPollMode
				? {
						options: state.pollOptions
							.filter((o) => o.trim())
							.map((o, i) => ({ id: `opt_${i}`, text: o.trim() })),
						allow_multiple: state.pollAllowMultiple,
						is_anonymous: state.pollIsAnonymous,
						ends_at: endsAt,
					}
				: undefined;

			await communityAPI.createPost(
				{
					group_id: groupId || "general",
					content: state.content.trim(),
					post_type: state.isPollMode
						? "poll"
						: mediaUrl
							? "resource"
							: "discussion",
					visibility: "school",
					media_url: mediaUrl,
					media_type: mediaType,
					poll_data: pollData,
					metadata:
						state.selectedTags.length > 0
							? { education_tags: state.selectedTags }
							: undefined,
				},
				myId,
				userCapacity,
				context.schoolId || "",
			);

			dispatch({ type: "RESET" });
			onClose();
		} catch (error) {
			console.error("[ComposerLogic] handleSubmit error:", error);
			dispatch({ type: "SET_UPLOADING", payload: false });
		} finally {
			dispatch({ type: "SET_SUBMITTING", payload: false });
		}
	}, [state, groupId, onClose, context.schoolId, userCapacity]);

	return {
		state,
		actions: {
			setContent: (payload: string) =>
				dispatch({ type: "SET_CONTENT", payload }),
			setSelectedImage: (payload: string | null) =>
				dispatch({ type: "SET_IMAGE", payload }),
			toggleTag: (payload: string) => dispatch({ type: "TOGGLE_TAG", payload }),
			setIsPollMode: (payload: boolean) =>
				dispatch({ type: "SET_POLL_MODE", payload }),
			pickImage,
			addPollOption: () => dispatch({ type: "ADD_POLL_OPTION" }),
			updatePollOption: (index: number, value: string) =>
				dispatch({ type: "UPDATE_POLL_OPTION", index, value }),
			removePollOption: (index: number) =>
				dispatch({ type: "REMOVE_POLL_OPTION", index }),
			setPollDurationHours: (payload: number | null) =>
				dispatch({ type: "SET_POLL_DURATION", payload }),
			setShowCustomDate: (payload: boolean) =>
				dispatch({ type: "SET_SHOW_CUSTOM_DATE", payload }),
			setPollCustomEndsAt: (payload: string) =>
				dispatch({ type: "SET_CUSTOM_DATE", payload }),
			setPollIsAnonymous: (payload: boolean) =>
				dispatch({ type: "SET_POLL_ANON", payload }),
			setPollAllowMultiple: (payload: boolean) =>
				dispatch({ type: "SET_POLL_MULTIPLE", payload }),
			handleSubmit,
			resetComposer: () => dispatch({ type: "RESET" }),
		},
	};
}
