import { template } from "lodash";

import { CodeLanguage } from "@phoenix/components/code";
import {
  fromOpenAIMessage,
  OpenAIMessage,
  promptMessageToOpenAI,
} from "@phoenix/schemas/messageSchemas";
import { isObject } from "@phoenix/typeUtils";

import type { PromptCodeExportCard__main$data as PromptVersion } from "./__generated__/PromptCodeExportCard__main.graphql";

export type PromptToSnippetParams = ({
  invocationParameters,
  modelName,
  modelProvider,
  responseFormat,
  tools,
  template,
}: Pick<
  PromptVersion,
  | "invocationParameters"
  | "modelName"
  | "modelProvider"
  | "responseFormat"
  | "tools"
> & {
  template: {
    messages: unknown[];
  };
}) => string;

const TAB = "  ";

/**
 * Indentation-aware JSON formatter
 *
 * @returns The formatted JSON string
 */
const jsonFormatter = ({
  json,
  level,
  removeKeyQuotes = false,
}: {
  /**
   * The JSON object to format
   */
  json: unknown;
  /**
   * The indentation level
   */
  level: number;
  /**
   * Whether to remove quotes from keys
   */
  removeKeyQuotes?: boolean;
}) => {
  const tabsWithLevel = TAB.repeat(level);
  let fmt = JSON.stringify(json, null, TAB);
  // add TABS before every line except the first
  // this allows you to add additional indentation to the emitted JSON
  fmt = fmt
    .split("\n")
    .map((line, index) => (index > 0 ? tabsWithLevel + line : line))
    .join("\n");

  if (removeKeyQuotes) {
    // Replace quoted keys with unquoted keys, but only when they're valid identifiers
    fmt = fmt.replace(/"([a-zA-Z_$][a-zA-Z0-9_$]*)"\s*:/g, "$1:");
  }

  return fmt;
};

type LanguageConfig = {
  assignmentOperator: string;
  removeKeyQuotes: boolean;
  stringQuote: string;
  template: (params: {
    tab: string;
    args: string[];
    messages: string;
  }) => string;
};

const openaiTemplatePython = template(
  `
from openai import OpenAI

client = OpenAI()

messages=<%= messages %>
# ^ apply additional templating to messages if needed

completion = client.chat.completions.create(
<% _.forEach(args, function(arg) { %><%= tab %><%= arg %>,
<% }); %>)

print(completion.choices[0].message)
`.trim()
);

const openaiTemplateTypeScript = template(
  `
import OpenAI from "openai";

const openai = new OpenAI();

const messages = <%= messages %>;
// ^ apply additional templating to messages if needed

const response = openai.chat.completions.create({
<% _.forEach(args, function(arg) { %><%= tab %><%= arg %>,
<% }); %>});

response.then((completion) => console.log(completion.choices[0].message));
`.trim()
);

const anthropicTemplatePython = template(
  `
from anthropic import Anthropic

client = Anthropic()

messages=<%= messages %>
# ^ apply additional templating to messages if needed

completion = client.messages.create(
<% _.forEach(args, function(arg) { %><%= tab %><%= arg %>,
<% }); %>)

print(completion.content)
`.trim()
);

const anthropicTemplateTypeScript = template(
  `
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const messages = <%= messages %>;
// ^ apply additional templating to messages if needed

const response = await client.messages.create({
<% _.forEach(args, function(arg) { %><%= tab %><%= arg %>,
<% }); %>});

console.log(response.content);
`.trim()
);

const languageConfigs: Record<string, Record<string, LanguageConfig>> = {
  python: {
    openai: {
      assignmentOperator: "=",
      removeKeyQuotes: false,
      stringQuote: '"',
      template: openaiTemplatePython,
    },
    anthropic: {
      assignmentOperator: "=",
      removeKeyQuotes: false,
      stringQuote: '"',
      template: anthropicTemplatePython,
    },
  },
  typescript: {
    openai: {
      assignmentOperator: ": ",
      removeKeyQuotes: true,
      stringQuote: '"',
      template: openaiTemplateTypeScript,
    },
    anthropic: {
      assignmentOperator: ": ",
      removeKeyQuotes: true,
      stringQuote: '"',
      template: anthropicTemplateTypeScript,
    },
  },
};

const preparePromptData = (
  prompt: Parameters<PromptToSnippetParams>[0],
  config: LanguageConfig
) => {
  if (!("messages" in prompt.template)) {
    throw new Error("Prompt template does not contain messages");
  }

  const args: string[] = [];
  const { assignmentOperator, removeKeyQuotes, stringQuote } = config;

  if (prompt.modelName) {
    args.push(
      `model${assignmentOperator}${stringQuote}${prompt.modelName}${stringQuote}`
    );
  }

  if (prompt.invocationParameters) {
    const invocationArgs = Object.entries(prompt.invocationParameters).map(
      ([key, value]) =>
        typeof value === "string"
          ? `${key}${assignmentOperator}${stringQuote}${value}${stringQuote}`
          : isObject(value)
            ? `${key}${assignmentOperator}${jsonFormatter({
                json: value,
                level: 1,
                removeKeyQuotes,
              })}`
            : `${key}${assignmentOperator}${value}`
    );
    args.push(...invocationArgs);
  }

  let messages = "";
  if (prompt.template.messages.length > 0) {
    const fmt = jsonFormatter({
      json: prompt.template.messages,
      level: 0,
      removeKeyQuotes,
    });
    messages = fmt;
    args.push(assignmentOperator === "=" ? "messages=messages" : "messages");
  }

  if (prompt.tools && prompt.tools.length > 0) {
    const fmt = jsonFormatter({
      json: prompt.tools.map((tool) => tool.definition),
      level: 1,
      removeKeyQuotes,
    });
    args.push(`tools${assignmentOperator}${fmt}`);
  }

  if (prompt.responseFormat && "definition" in prompt.responseFormat) {
    const fmt = jsonFormatter({
      json: prompt.responseFormat.definition,
      level: 1,
      removeKeyQuotes,
    });
    args.push(`response_format${assignmentOperator}${fmt}`);
  }

  return { args, messages };
};

/**
 * Convert OpenAI messages to OpenAI SDK messages, for use in the native SDK
 *
 * @todo The playground really needs to manage messages fully in Phoenix Prompt format, or, in
 * native SDK format. This in-between format is a mess.
 *
 * @param message the message to convert
 * @returns the converted message
 */
const convertOpenAIMessageToOpenAISDKMessage = (message: OpenAIMessage) => {
  if ("tool_calls" in message && message.tool_calls) {
    return {
      ...message,
      tool_calls: message.tool_calls.map((toolCall) => ({
        ...toolCall,
        function: {
          ...toolCall.function,
          arguments: JSON.stringify(toolCall.function.arguments),
        },
      })),
    };
  } else {
    return message;
  }
};

export const promptCodeSnippets: Record<
  string,
  Record<string, PromptToSnippetParams>
> = {
  python: {
    openai: (prompt) => {
      const config = languageConfigs.python.openai;
      const convertedPrompt = {
        ...prompt,
        template: {
          ...prompt.template,
          messages: prompt.template.messages.map((m) =>
            convertOpenAIMessageToOpenAISDKMessage(m as OpenAIMessage)
          ),
        },
      };
      const { args, messages } = preparePromptData(convertedPrompt, config);
      return config.template({
        tab: TAB,
        args,
        messages,
      });
    },
    anthropic: (prompt) => {
      const config = languageConfigs.python.anthropic;
      const { args, messages } = preparePromptData(prompt, config);
      return config.template({
        tab: TAB,
        args,
        messages,
      });
    },
  },
  typescript: {
    openai: (prompt) => {
      const config = languageConfigs.typescript.openai;
      const convertedPrompt = {
        ...prompt,
        template: {
          ...prompt.template,
          messages: prompt.template.messages.map((m) =>
            convertOpenAIMessageToOpenAISDKMessage(m as OpenAIMessage)
          ),
        },
      };
      const { args, messages } = preparePromptData(convertedPrompt, config);
      return config.template({
        tab: TAB,
        args,
        messages,
      });
    },
    anthropic: (prompt) => {
      const config = languageConfigs.typescript.anthropic;
      const { args, messages } = preparePromptData(prompt, config);
      return config.template({
        tab: TAB,
        args,
        messages,
      });
    },
  },
};

export const mapPromptToSnippet = ({
  promptVersion,
  language,
}: {
  promptVersion: Omit<PromptVersion, " $fragmentType">;
  language: CodeLanguage;
}) => {
  const generator =
    promptCodeSnippets[language.toLocaleLowerCase()][
      promptVersion.modelProvider?.toLocaleLowerCase()
    ];
  if (!generator) {
    return null;
  }

  if (!("messages" in promptVersion.template)) {
    return null;
  }

  const convertedPrompt = {
    ...promptVersion,
    template: {
      ...promptVersion.template,
      messages: promptVersion.template.messages
        .map((message) => {
          try {
            return fromOpenAIMessage({
              message: promptMessageToOpenAI.parse(message),
              targetProvider: promptVersion.modelProvider as ModelProvider,
            });
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn("Cannot convert message");
            // eslint-disable-next-line no-console
            console.error(e);
            return null;
          }
        })
        .filter(Boolean),
    },
  };
  return generator(convertedPrompt);
};
