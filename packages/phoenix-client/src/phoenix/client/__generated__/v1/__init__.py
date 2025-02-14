"""Do not edit"""

from __future__ import annotations

from typing import Any, Literal, Mapping, Optional, Sequence, TypedDict, Union

from typing_extensions import NotRequired


class CreateExperimentRequestBody(TypedDict):
    name: NotRequired[str]
    description: NotRequired[str]
    metadata: NotRequired[Mapping[str, Any]]
    version_id: NotRequired[str]
    repetitions: NotRequired[int]


class Dataset(TypedDict):
    id: str
    name: str
    description: Optional[str]
    metadata: Mapping[str, Any]
    created_at: str
    updated_at: str


class DatasetExample(TypedDict):
    id: str
    input: Mapping[str, Any]
    output: Mapping[str, Any]
    metadata: Mapping[str, Any]
    updated_at: str


class DatasetVersion(TypedDict):
    version_id: str
    description: Optional[str]
    metadata: Mapping[str, Any]
    created_at: str


class DatasetWithExampleCount(TypedDict):
    id: str
    name: str
    description: Optional[str]
    metadata: Mapping[str, Any]
    created_at: str
    updated_at: str
    example_count: int


class Experiment(TypedDict):
    id: str
    dataset_id: str
    dataset_version_id: str
    repetitions: int
    metadata: Mapping[str, Any]
    project_name: Optional[str]
    created_at: str
    updated_at: str


class GetDatasetResponseBody(TypedDict):
    data: DatasetWithExampleCount


class GetExperimentResponseBody(TypedDict):
    data: Experiment


class InsertedSpanAnnotation(TypedDict):
    id: str


class JSONSchemaDraft7ObjectSchema(TypedDict):
    type: Literal["json-schema-draft-7-object-schema"]
    json: Mapping[str, Any]


class ListDatasetExamplesData(TypedDict):
    dataset_id: str
    version_id: str
    examples: Sequence[DatasetExample]


class ListDatasetExamplesResponseBody(TypedDict):
    data: ListDatasetExamplesData


class ListDatasetVersionsResponseBody(TypedDict):
    data: Sequence[DatasetVersion]
    next_cursor: Optional[str]


class ListDatasetsResponseBody(TypedDict):
    data: Sequence[Dataset]
    next_cursor: Optional[str]


class ListExperimentsResponseBody(TypedDict):
    data: Sequence[Experiment]


class PromptData(TypedDict):
    name: str
    description: NotRequired[str]
    source_prompt_id: NotRequired[str]


class Prompt(PromptData):
    id: str


class PromptAnthropicInvocationParametersContent(TypedDict):
    max_tokens: int
    temperature: NotRequired[float]
    top_p: NotRequired[float]
    stop_sequences: NotRequired[Sequence[str]]


class PromptAzureOpenAIInvocationParametersContent(TypedDict):
    temperature: NotRequired[float]
    max_tokens: NotRequired[int]
    frequency_penalty: NotRequired[float]
    presence_penalty: NotRequired[float]
    top_p: NotRequired[float]
    seed: NotRequired[int]
    reasoning_effort: NotRequired[Literal["low", "medium", "high"]]


class PromptFunctionTool(TypedDict):
    type: Literal["function-tool"]
    name: str
    description: NotRequired[str]
    schema: NotRequired[JSONSchemaDraft7ObjectSchema]
    extra_parameters: NotRequired[Mapping[str, Any]]


class PromptGeminiInvocationParametersContent(TypedDict):
    temperature: NotRequired[float]
    max_output_tokens: NotRequired[int]
    stop_sequences: NotRequired[Sequence[str]]
    presence_penalty: NotRequired[float]
    frequency_penalty: NotRequired[float]
    top_p: NotRequired[float]
    top_k: NotRequired[int]


class PromptOpenAIInvocationParametersContent(TypedDict):
    temperature: NotRequired[float]
    max_tokens: NotRequired[int]
    frequency_penalty: NotRequired[float]
    presence_penalty: NotRequired[float]
    top_p: NotRequired[float]
    seed: NotRequired[int]
    reasoning_effort: NotRequired[Literal["low", "medium", "high"]]


class PromptResponseFormatJSONSchema(TypedDict):
    type: Literal["response-format-json-schema"]
    name: str
    schema: JSONSchemaDraft7ObjectSchema
    extra_parameters: Mapping[str, Any]
    description: NotRequired[str]


class PromptStringTemplate(TypedDict):
    type: Literal["string"]
    template: str


class PromptToolChoiceNone(TypedDict):
    type: Literal["none"]


class PromptToolChoiceOneOrMore(TypedDict):
    type: Literal["one-or-more"]


class PromptToolChoiceSpecificFunctionTool(TypedDict):
    type: Literal["specific-function-tool"]
    function_name: str


class PromptToolChoiceZeroOrMore(TypedDict):
    type: Literal["zero-or-more"]


class PromptTools(TypedDict):
    type: Literal["tools"]
    tools: Sequence[PromptFunctionTool]
    tool_choice: NotRequired[
        Union[
            PromptToolChoiceNone,
            PromptToolChoiceZeroOrMore,
            PromptToolChoiceOneOrMore,
            PromptToolChoiceSpecificFunctionTool,
        ]
    ]
    disable_parallel_tool_calls: NotRequired[bool]


class SpanAnnotationResult(TypedDict):
    label: NotRequired[str]
    score: NotRequired[float]
    explanation: NotRequired[str]


class TextContentPart(TypedDict):
    type: Literal["text"]
    text: str


class ToolCallFunction(TypedDict):
    type: Literal["function"]
    name: str
    arguments: str


class ToolResultContentPart(TypedDict):
    type: Literal["tool_result"]
    tool_call_id: str
    tool_result: Optional[Union[bool, int, float, str, Mapping[str, Any], Sequence[Any]]]


class UploadDatasetData(TypedDict):
    dataset_id: str


class UploadDatasetResponseBody(TypedDict):
    data: UploadDatasetData


class ValidationError(TypedDict):
    loc: Sequence[Union[str, int]]
    msg: str
    type: str


class AnnotateSpansResponseBody(TypedDict):
    data: Sequence[InsertedSpanAnnotation]


class CreateExperimentResponseBody(TypedDict):
    data: Experiment


class GetPromptsResponseBody(TypedDict):
    data: Sequence[Prompt]


class HTTPValidationError(TypedDict):
    detail: NotRequired[Sequence[ValidationError]]


class PromptAnthropicInvocationParameters(TypedDict):
    type: Literal["anthropic"]
    anthropic: PromptAnthropicInvocationParametersContent


class PromptAzureOpenAIInvocationParameters(TypedDict):
    type: Literal["azure_openai"]
    azure_openai: PromptAzureOpenAIInvocationParametersContent


class PromptGeminiInvocationParameters(TypedDict):
    type: Literal["gemini"]
    gemini: PromptGeminiInvocationParametersContent


class PromptOpenAIInvocationParameters(TypedDict):
    type: Literal["openai"]
    openai: PromptOpenAIInvocationParametersContent


class SpanAnnotation(TypedDict):
    span_id: str
    name: str
    annotator_kind: Literal["LLM", "HUMAN"]
    result: NotRequired[SpanAnnotationResult]
    metadata: NotRequired[Mapping[str, Any]]


class ToolCallContentPart(TypedDict):
    type: Literal["tool_call"]
    tool_call_id: str
    tool_call: ToolCallFunction


class AnnotateSpansRequestBody(TypedDict):
    data: Sequence[SpanAnnotation]


class PromptMessage(TypedDict):
    role: Literal["user", "assistant", "model", "ai", "tool", "system", "developer"]
    content: Union[
        str, Sequence[Union[TextContentPart, ToolCallContentPart, ToolResultContentPart]]
    ]


class PromptChatTemplate(TypedDict):
    type: Literal["chat"]
    messages: Sequence[PromptMessage]


class PromptVersionData(TypedDict):
    model_provider: Literal["OPENAI", "AZURE_OPENAI", "ANTHROPIC", "GEMINI"]
    model_name: str
    template: Union[PromptChatTemplate, PromptStringTemplate]
    template_type: Literal["STR", "CHAT"]
    template_format: Literal["MUSTACHE", "FSTRING", "NONE"]
    invocation_parameters: Union[
        PromptOpenAIInvocationParameters,
        PromptAzureOpenAIInvocationParameters,
        PromptAnthropicInvocationParameters,
        PromptGeminiInvocationParameters,
    ]
    description: NotRequired[str]
    tools: NotRequired[PromptTools]
    response_format: NotRequired[PromptResponseFormatJSONSchema]


class PromptVersion(PromptVersionData):
    id: str


class CreatePromptRequestBody(TypedDict):
    prompt: PromptData
    version: PromptVersionData


class CreatePromptResponseBody(TypedDict):
    data: PromptVersion


class GetPromptResponseBody(TypedDict):
    data: PromptVersion


class GetPromptVersionsResponseBody(TypedDict):
    data: Sequence[PromptVersion]
