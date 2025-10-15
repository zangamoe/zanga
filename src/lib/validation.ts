import { z } from "zod";

// Input validation schemas for user-generated content
export const commentSchema = z.object({
  comment: z
    .string()
    .trim()
    .min(1, { message: "Comment cannot be empty" })
    .max(1000, { message: "Comment must be less than 1000 characters" })
    .refine(
      (val) => !/<script|javascript:|onerror=/i.test(val),
      { message: "Invalid content detected" }
    ),
});

export const ratingSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, { message: "Rating must be at least 1" })
    .max(5, { message: "Rating must be at most 5" }),
});

export const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
});

export const searchQuerySchema = z.object({
  query: z
    .string()
    .trim()
    .max(100, { message: "Search query too long" })
    .refine(
      (val) => !/<|>|script/i.test(val),
      { message: "Invalid search characters" }
    ),
});

// Sanitize HTML content
export const sanitizeHtml = (html: string): string => {
  // Remove all HTML tags except safe ones
  const allowedTags = /(<\/?(b|i|em|strong|p|br)>)/gi;
  return html.replace(/<[^>]*>/g, (match) => {
    return allowedTags.test(match) ? match : "";
  });
};

// Validate and sanitize user input
export const validateInput = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } => {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return { success: false, error: firstError.message };
    }
    return { success: false, error: "Validation failed" };
  }
};
