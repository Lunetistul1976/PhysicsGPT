export const getResponseObject = (response: string) => {
  // First, remove any content inside <think> tags
  const responseWithoutThinkTags = response
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .trim();

  // If the response is now empty, return the original
  if (!responseWithoutThinkTags) {
    return { content: response };
  }

  const cleanedResponse = responseWithoutThinkTags
    // Remove HTML tags around JSON
    .replace(/<p>\s*({)/, "$1")
    .replace(/}\s*<\/p>/, "$1")

    .replace(/\n/g, " ") // Replace newlines with spaces
    .replace(/\r/g, "") // Remove carriage returns
    .replace(/\\n/g, " ") // Replace escaped newlines
    .replace(/\t/g, " ") // Replace tabs with spaces
    .replace(/\s+/g, " ") // Normalize spaces (multiple spaces to single)
    .trim();

  try {
    const jsonObject = JSON.parse(cleanedResponse);
    return jsonObject;
  } catch (jsonError) {
    console.error(
      "JSON parsing failed, returning cleaned response as content:",
      jsonError
    );
    // Attempt to extract content and reasoning using regex
    const result: { content?: string; reasoning?: string } = {};

    const contentMatch = cleanedResponse.match(
      /content:\s*([^}]*?)(?:,\s*reasoning+:|$)/
    );
    console.log("contentMatch", contentMatch);
    if (contentMatch && contentMatch[1]) {
      result.content = contentMatch[1].trim();
    }

    const reasoningMatch = cleanedResponse.match(
      /reasoning:\s*([^}]*?)(?:,\s*\w+:|$)/
    );
    if (reasoningMatch && reasoningMatch[1]) {
      result.reasoning = reasoningMatch[1].trim();
    }

    if (!result.content && !result.reasoning) {
      return { content: cleanedResponse };
    }

    return result;
  }
};
