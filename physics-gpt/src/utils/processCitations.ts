export const processCitationsInContent = (
  content: string,
  citations: string[] = []
) => {
  if (!citations || citations.length === 0 || !content) {
    return content;
  }

  const citationRegex = /\[(\d+)\]/g;

  // Replace each citation reference with a link
  return content.replace(citationRegex, (match, citationNumber) => {
    const index = parseInt(citationNumber, 10) - 1;

    if (index >= 0 && index < citations.length) {
      const citation = citations[index];

      if (citation) {
        return `<a href=${citation} target="_blank" rel="noopener noreferrer">${match}</a>`;
      }
    }

    return match;
  });
};
