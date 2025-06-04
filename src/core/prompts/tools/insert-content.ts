import { ToolArgs } from "./types"

export function getInsertContentDescription(args: ToolArgs): string {
	return `## insert_content
Description: Use this tool specifically for adding new lines of content into a file without modifying existing content. Specify the line number to insert before, or use line 0 to append to the end. Ideal for adding imports, functions, configuration blocks, log entries, or any multi-line text block.

Parameters:
- path: (required) File path relative to workspace directory ${args.cwd.toPosix()}
- line: (required) Line number where content will be inserted (1-based)
	      Use 0 to append at end of file
	      Use any positive number to insert before that line
- content: (required) The content to insert at the specified line

Example for inserting imports at start of file:
<insert_content>
<path>src/utils.ts</path>
<line>1</line>
<content>
// Add imports at start of file
import { sum } from './math';
</content>
</insert_content>

Example for appending to the end of file:
<insert_content>
<path>src/utils.ts</path>
<line>0</line>
<content>
// This is the end of the file
</content>
</insert_content>
`
}

export function getSchema() {
	return {
		name: "insert_content",
		description: "Insert content into a file",
		parameters: {
			type: "object",
			properties: {
				path: { type: "string" },
				line: { type: "integer" },
				content: { type: "string" },
			},
			required: ["path", "line", "content"],
		},
	}
}
