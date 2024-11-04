import { z } from "zod";

export const DiscountSchema = z
  .object({
    code: z
      .string({ required_error: "Code is required" })
      .min(3, { message: "Code should be more than 3 characters" })
      .max(20, { message: "Code should be less than 20 characters" }),

    discountType: z.enum(["value", "percent"], {
      required_error: "Discount type is required [value/percent]",
      message: "Enter a valid discount type [value/percent]",
    }),

    originalPrice: z.number({
      required_error: "Original Price is required",
      message: "Enter a valid original price",
    }),

    discountValue: z.number({
      required_error: "Discount Value is required",
      message: "Enter a valid discount value",
    }),

    usageLimit: z.enum(["limited", "unlimited"], {
      required_error: "Usage limit is required [limited/unlimited]",
      message: "Enter a valid usage limit is required [limited/unlimited]",
    }),

    usageLimitValue: z
      .number({
        required_error: "Usage Limit Value is required",
      })
      .optional()
      .nullable(),

    activeFromValue: z.number({
      required_error: "Active From Value is required",
    }),

    timeLimit: z.enum(["limited", "unlimited"], {
      required_error: "Time Limit is required",
      message: "Enter a valid time limit",
    }),

    timeLimitValue: z
      .number({
        required_error: "Time Limit Value is required",
      })
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    switch (data.discountType) {
      case "value":
        if (data.discountValue >= data.originalPrice) {
          ctx.addIssue({
            message: "Discount value must be less than the price",
            code: z.ZodIssueCode.custom,
          });
        }
        break;
      case "percent":
        if (data.discountValue < 1 || data.discountValue >= 100) {
          ctx.addIssue({
            message: "New Price should not be more than new price",
            code: z.ZodIssueCode.custom,
          });
        }
        break;
    }

    if (data.timeLimit === "limited") {
      if (!data.timeLimitValue || data.timeLimitValue <= data.activeFromValue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Time Limit value should be more than active from",
        });
      }
    }

    if (data.usageLimit === "limited" && Number(data.usageLimitValue) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Usage Limit must be greater than 0",
      });
    }
  });
