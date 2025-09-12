import { useEffect, useMemo, useState } from "react";
import { getCookie, setCookie } from "@/lib/cookies";
import { ALL_MODELS, MODELS } from "@/utils/resolve-models";

const DEFAULT_MODEL = "GPT-5 Mini";
const COOKIE_NAME = "firstbook:selectedModel";

export function useModelSelection() {
	const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
	const [modelQuery, setModelQuery] = useState("");

	const allModels = useMemo(() => Object.values(MODELS).flat(), []);

	const filteredModels = useMemo(
		() =>
			allModels.filter((m) =>
				m.toLowerCase().includes(modelQuery.toLowerCase()),
			),
		[allModels, modelQuery],
	);

	const selectModel = (model: string) => {
		setSelectedModel(model);
		setCookie(COOKIE_NAME, model);
	};

	useEffect(() => {
		const saved = getCookie(COOKIE_NAME);
		if (saved && (ALL_MODELS as readonly string[]).includes(saved)) {
			setSelectedModel(saved);
		} else if (!saved) {
			setCookie(COOKIE_NAME, DEFAULT_MODEL);
		}
	}, []);

	return {
		selectedModel,
		selectModel,
		modelQuery,
		setModelQuery,
		filteredModels,
		allModels,
	};
}
