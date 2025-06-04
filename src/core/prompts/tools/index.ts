import type { ToolName, ModeConfig } from "@roo-code/types"

import { TOOL_GROUPS, ALWAYS_AVAILABLE_TOOLS, DiffStrategy } from "../../../shared/tools"
import { McpHub } from "../../../services/mcp/McpHub"
import { Mode, getModeConfig, isToolAllowedForMode, getGroupName } from "../../../shared/modes"

import { ToolArgs } from "./types"
import { getExecuteCommandDescription, getSchema as getExecuteCommandSchema } from "./execute-command"
import { getReadFileDescription, getSchema as getReadFileSchema } from "./read-file"
import { getFetchInstructionsDescription, getSchema as getFetchInstructionsSchema } from "./fetch-instructions"
import { getWriteToFileDescription, getSchema as getWriteToFileSchema } from "./write-to-file"
import { getSearchFilesDescription, getSchema as getSearchFilesSchema } from "./search-files"
import { getListFilesDescription, getSchema as getListFilesSchema } from "./list-files"
import { getInsertContentDescription, getSchema as getInsertContentSchema } from "./insert-content"
import { getSearchAndReplaceDescription, getSchema as getSearchAndReplaceSchema } from "./search-and-replace"
import {
	getListCodeDefinitionNamesDescription,
	getSchema as getListCodeDefinitionNamesSchema,
} from "./list-code-definition-names"
import { getBrowserActionDescription, getSchema as getBrowserActionSchema } from "./browser-action"
import { getAskFollowupQuestionDescription, getSchema as getAskFollowupQuestionSchema } from "./ask-followup-question"
import { getAttemptCompletionDescription, getSchema as getAttemptCompletionSchema } from "./attempt-completion"
import { getUseMcpToolDescription, getSchema as getUseMcpToolSchema } from "./use-mcp-tool"
import { getAccessMcpResourceDescription, getSchema as getAccessMcpResourceSchema } from "./access-mcp-resource"
import { getSwitchModeDescription, getSchema as getSwitchModeSchema } from "./switch-mode"
import { getNewTaskDescription, getSchema as getNewTaskSchema } from "./new-task"
import { getCodebaseSearchDescription, getSchema as getCodebaseSearchSchema } from "./codebase-search"
import { CodeIndexManager } from "../../../services/code-index/manager"

// Map of tool names to their description functions
const toolDescriptionMap: Record<string, (args: ToolArgs) => string | undefined> = {
	execute_command: (args) => getExecuteCommandDescription(args),
	read_file: (args) => getReadFileDescription(args),
	fetch_instructions: () => getFetchInstructionsDescription(),
	write_to_file: (args) => getWriteToFileDescription(args),
	search_files: (args) => getSearchFilesDescription(args),
	list_files: (args) => getListFilesDescription(args),
	list_code_definition_names: (args) => getListCodeDefinitionNamesDescription(args),
	browser_action: (args) => getBrowserActionDescription(args),
	ask_followup_question: () => getAskFollowupQuestionDescription(),
	attempt_completion: () => getAttemptCompletionDescription(),
	use_mcp_tool: (args) => getUseMcpToolDescription(args),
	access_mcp_resource: (args) => getAccessMcpResourceDescription(args),
	codebase_search: () => getCodebaseSearchDescription(),
	switch_mode: () => getSwitchModeDescription(),
	new_task: (args) => getNewTaskDescription(args),
	insert_content: (args) => getInsertContentDescription(args),
	search_and_replace: (args) => getSearchAndReplaceDescription(args),
	apply_diff: (args) =>
		args.diffStrategy ? args.diffStrategy.getToolDescription({ cwd: args.cwd, toolOptions: args.toolOptions }) : "",
}

const toolSchemaMap: Record<string, (args: ToolArgs) => any | undefined> = {
	execute_command: () => getExecuteCommandSchema(),
	read_file: () => getReadFileSchema(),
	fetch_instructions: () => getFetchInstructionsSchema(),
	write_to_file: () => getWriteToFileSchema(),
	search_files: () => getSearchFilesSchema(),
	list_files: () => getListFilesSchema(),
	list_code_definition_names: () => getListCodeDefinitionNamesSchema(),
	browser_action: () => getBrowserActionSchema(),
	ask_followup_question: () => getAskFollowupQuestionSchema(),
	attempt_completion: () => getAttemptCompletionSchema(),
	use_mcp_tool: () => getUseMcpToolSchema(),
	access_mcp_resource: () => getAccessMcpResourceSchema(),
	codebase_search: () => getCodebaseSearchSchema(),
	switch_mode: () => getSwitchModeSchema(),
	new_task: () => getNewTaskSchema(),
	insert_content: () => getInsertContentSchema(),
	search_and_replace: () => getSearchAndReplaceSchema(),
}

export function getToolDescriptionsForMode(
	mode: Mode,
	cwd: string,
	supportsComputerUse: boolean,
	codeIndexManager?: CodeIndexManager,
	diffStrategy?: DiffStrategy,
	browserViewportSize?: string,
	mcpHub?: McpHub,
	customModes?: ModeConfig[],
	experiments?: Record<string, boolean>,
	partialReadsEnabled?: boolean,
	settings?: Record<string, any>,
): string {
	const config = getModeConfig(mode, customModes)
	const args: ToolArgs = {
		cwd,
		supportsComputerUse,
		diffStrategy,
		browserViewportSize,
		mcpHub,
		partialReadsEnabled,
		settings,
	}

	const tools = new Set<string>()

	// Add tools from mode's groups
	config.groups.forEach((groupEntry) => {
		const groupName = getGroupName(groupEntry)
		const toolGroup = TOOL_GROUPS[groupName]
		if (toolGroup) {
			toolGroup.tools.forEach((tool) => {
				if (
					isToolAllowedForMode(
						tool as ToolName,
						mode,
						customModes ?? [],
						undefined,
						undefined,
						experiments ?? {},
					)
				) {
					tools.add(tool)
				}
			})
		}
	})

	// Add always available tools
	ALWAYS_AVAILABLE_TOOLS.forEach((tool) => tools.add(tool))

	// Conditionally exclude codebase_search if feature is disabled or not configured
	if (
		!codeIndexManager ||
		!(codeIndexManager.isFeatureEnabled && codeIndexManager.isFeatureConfigured && codeIndexManager.isInitialized)
	) {
		tools.delete("codebase_search")
	}

	// Map tool descriptions for allowed tools
	const descriptions = Array.from(tools).map((toolName) => {
		const descriptionFn = toolDescriptionMap[toolName]
		if (!descriptionFn) {
			return undefined
		}

		return descriptionFn({
			...args,
			toolOptions: undefined, // No tool options in group-based approach
		})
	})

	return `# Tools\n\n${descriptions.filter(Boolean).join("\n\n")}`
}

export function buildToolSchemas(
	mode: Mode,
	cwd: string,
	supportsComputerUse: boolean,
	codeIndexManager?: CodeIndexManager,
	diffStrategy?: DiffStrategy,
	browserViewportSize?: string,
	mcpHub?: McpHub,
	customModes?: ModeConfig[],
	experiments?: Record<string, boolean>,
	partialReadsEnabled?: boolean,
	settings?: Record<string, any>,
): any[] {
	const config = getModeConfig(mode, customModes)
	const args: ToolArgs = {
		cwd,
		supportsComputerUse,
		diffStrategy,
		browserViewportSize,
		mcpHub,
		partialReadsEnabled,
		settings,
	}

	const tools = new Set<string>()
	config.groups.forEach((groupEntry) => {
		const groupName = getGroupName(groupEntry)
		const toolGroup = TOOL_GROUPS[groupName]
		if (toolGroup) {
			toolGroup.tools.forEach((tool) => {
				if (
					isToolAllowedForMode(
						tool as ToolName,
						mode,
						customModes ?? [],
						undefined,
						undefined,
						experiments ?? {},
					)
				) {
					tools.add(tool)
				}
			})
		}
	})

	ALWAYS_AVAILABLE_TOOLS.forEach((tool) => tools.add(tool))

	if (
		!codeIndexManager ||
		!(codeIndexManager.isFeatureEnabled && codeIndexManager.isFeatureConfigured && codeIndexManager.isInitialized)
	) {
		tools.delete("codebase_search")
	}

	const schemas = Array.from(tools).map((toolName) => {
		const schemaFn = toolSchemaMap[toolName]
		return schemaFn ? schemaFn(args) : undefined
	})

	return schemas.filter(Boolean)
}

// Export individual description functions for backward compatibility
export {
	getExecuteCommandDescription,
	getReadFileDescription,
	getFetchInstructionsDescription,
	getWriteToFileDescription,
	getSearchFilesDescription,
	getListFilesDescription,
	getListCodeDefinitionNamesDescription,
	getBrowserActionDescription,
	getAskFollowupQuestionDescription,
	getAttemptCompletionDescription,
	getUseMcpToolDescription,
	getAccessMcpResourceDescription,
	getSwitchModeDescription,
	getInsertContentDescription,
	getSearchAndReplaceDescription,
	getCodebaseSearchDescription,
	getExecuteCommandSchema,
	getReadFileSchema,
	getFetchInstructionsSchema,
	getWriteToFileSchema,
	getSearchFilesSchema,
	getListFilesSchema,
	getListCodeDefinitionNamesSchema,
	getBrowserActionSchema,
	getAskFollowupQuestionSchema,
	getAttemptCompletionSchema,
	getUseMcpToolSchema,
	getAccessMcpResourceSchema,
	getSwitchModeSchema,
	getInsertContentSchema,
	getSearchAndReplaceSchema,
	getCodebaseSearchSchema,
}
