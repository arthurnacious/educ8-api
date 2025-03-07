/**
 * Converts a string to a URL-friendly slug
 * @param text The text to convert to a slug
 * @param options Configuration options
 * @returns A slugified string
 */
export function slugify(
  text: string,
  options: {
    lower?: boolean;
    replacement?: string;
    remove?: RegExp;
    strict?: boolean;
  } = {}
): string {
  // Default options
  const defaults = {
    lower: true,
    replacement: "-",
    remove: /[*+~.()'"!:@]/g,
    strict: false,
  };

  // Merge options with defaults
  const opts = { ...defaults, ...options };

  // Convert text to lowercase if specified
  let result = opts.lower ? text.toLowerCase() : text;

  // Replace spaces with the replacement character
  result = result.replace(/\s+/g, opts.replacement);

  // Remove special characters
  if (opts.remove) {
    result = result.replace(opts.remove, "");
  }

  // Replace multiple instances of the replacement character with a single instance
  const replRegex = new RegExp(`\\${opts.replacement}+`, "g");
  result = result.replace(replRegex, opts.replacement);

  // Remove replacement characters from the beginning and end
  result = result.replace(
    new RegExp(`^\\${opts.replacement}+|\\${opts.replacement}+$`, "g"),
    ""
  );

  // If strict mode is enabled, remove any characters that aren't alphanumeric, underscore or the replacement character
  if (opts.strict) {
    result = result.replace(
      new RegExp(`[^a-zA-Z0-9\\${opts.replacement}]`, "g"),
      ""
    );
  }

  return result;
}
