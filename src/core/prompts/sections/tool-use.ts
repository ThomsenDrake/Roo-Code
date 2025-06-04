export function getSharedToolUseSection(): string {
	return `====

TOOL USE

You have access to a set of tools that are executed upon the user's approval. You can use one tool per message, and will receive the result of that tool use in the user's response. You use tools step-by-step to accomplish a given task, with each tool use informed by the result of the previous tool use.

# Tool Use Formatting

When the underlying model supports function calling, Roo Code automatically formats tool uses as JSON function calls. If function calling isn't available, it falls back to XML-style tags instead. You can force the XML format via the \`roo-cline.toolUseFormat\` setting.

Tool uses formatted as XML look like this:

<actual_tool_name>
<parameter1_name>value1</parameter1_name>
<parameter2_name>value2</parameter2_name>
...
</actual_tool_name>

For example, to use the new_task tool:

<new_task>
<mode>code</mode>
<message>Implement a new feature for the application.</message>
</new_task>

Always use the actual tool name as the XML tag name for proper parsing and execution.`
}

export function buildToolUseSection(useNative: boolean): string {
	if (useNative) {
		return `====

TOOL USE

You have access to a set of tools that can be invoked using OpenAI/Claude JSON tool calling. Include \`\"function_call\": \"auto\"\` in your request and provide arguments that follow each tool's JSON schema.`
	}

	return getSharedToolUseSection()
}
