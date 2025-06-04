export type ApiStream = AsyncGenerator<ApiStreamChunk>

export type ApiStreamChunk = ApiStreamTextChunk | ApiStreamUsageChunk | ApiStreamReasoningChunk | ApiStreamToolUseChunk

export interface ApiStreamTextChunk {
	type: "text"
	text: string
}

export interface ApiStreamReasoningChunk {
	type: "reasoning"
	text: string
}

export interface ApiStreamUsageChunk {
	type: "usage"
	inputTokens: number
	outputTokens: number
	cacheWriteTokens?: number
	cacheReadTokens?: number
	reasoningTokens?: number
	totalCost?: number
}

export interface ApiStreamToolUseChunk {
	type: "tool_use"
	name: string
	params: Record<string, any>
	partial: boolean
}
