import { useCallback } from "react"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { Checkbox } from "vscrui"

import type { ProviderSettings } from "@roo-code/types"

import { useAppTranslation } from "@src/i18n/TranslationContext"
import { VSCodeButtonLink } from "@src/components/common/VSCodeButtonLink"

import { inputEventTransform, noTransform } from "../transforms"

type GroqProps = {
	apiConfiguration: ProviderSettings
	setApiConfigurationField: (field: keyof ProviderSettings, value: ProviderSettings[keyof ProviderSettings]) => void
}

export const Groq = ({ apiConfiguration, setApiConfigurationField }: GroqProps) => {
	const { t } = useAppTranslation()

	const handleInputChange = useCallback(
		<K extends keyof ProviderSettings, E>(
			field: K,
			transform: (event: E) => ProviderSettings[K] = inputEventTransform,
		) =>
			(event: E | Event) => {
				setApiConfigurationField(field, transform(event as E))
			},
		[setApiConfigurationField],
	)

	return (
		<>
			<VSCodeTextField
				value={apiConfiguration?.groqApiKey || ""}
				type="password"
				onInput={handleInputChange("groqApiKey")}
				placeholder={t("settings:placeholders.apiKey")}
				className="w-full">
				<label className="block font-medium mb-1">{t("settings:providers.groqApiKey")}</label>
			</VSCodeTextField>
			<div className="text-sm text-vscode-descriptionForeground -mt-2">
				{t("settings:providers.apiKeyStorageNotice")}
			</div>
			{!apiConfiguration?.groqApiKey && (
				<VSCodeButtonLink href="https://console.groq.com/keys" appearance="secondary">
					{t("settings:providers.getGroqApiKey")}
				</VSCodeButtonLink>
			)}
			{apiConfiguration?.apiProvider !== "openai" &&
				apiConfiguration?.apiProvider !== "anthropic" &&
				!apiConfiguration?.openAiUseAzure && (
					<Checkbox
						checked={apiConfiguration?.useNativeToolCalls ?? false}
						onChange={handleInputChange("useNativeToolCalls", noTransform)}>
						{t("settings:providers.useNativeToolCalls")}
					</Checkbox>
				)}
		</>
	)
}
