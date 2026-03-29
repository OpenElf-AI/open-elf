import * as z from 'zod';

export const phoneSchema = z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号');

export const codeSchema = z
  .string()
  .length(6, '验证码必须是6位数字')
  .regex(/^\d+$/, '验证码只能是数字');

export const passwordSchema = z.string().min(6, '密码至少6个字符').max(32, '密码最多32个字符');

export const nameSchema = z
  .string()
  .min(1, '昵称不能为空')
  .min(2, '昵称至少2个字符')
  .max(20, '昵称最多20个字符');

export const descriptionSchema = z.string().max(200, '描述最多200个字符').optional();

export const agentNameSchema = z
  .string()
  .min(1, '智能体名称不能为空')
  .min(2, '智能体名称至少2个字符')
  .max(30, '智能体名称最多30个字符');

export const agentDescriptionSchema = z
  .string()
  .min(1, '智能体描述不能为空')
  .min(10, '智能体描述至少10个字符')
  .max(500, '智能体描述最多500个字符');

export const agentSystemPromptSchema = z
  .string()
  .min(1, '系统提示词不能为空')
  .min(20, '系统提示词至少20个字符')
  .max(2000, '系统提示词最多2000个字符');

export const agentPriceSchema = z.number().min(0, '价格不能为负数').max(9999, '价格最多9999元');

export const loginSchema = z.object({
  phone: phoneSchema,
  code: codeSchema,
});

export const registerSchema = z.object({
  phone: phoneSchema,
  code: codeSchema,
  name: nameSchema,
});

export const profileSchema = z.object({
  name: nameSchema,
});

export const createAgentSchema = z.object({
  name: agentNameSchema,
  description: agentDescriptionSchema,
  systemPrompt: agentSystemPromptSchema,
  price: agentPriceSchema,
  avatar: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const messageSchema = z.object({
  content: z.string().min(1, '消息不能为空').max(2000, '消息最多2000个字符'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type CreateAgentFormValues = z.infer<typeof createAgentSchema>;
export type MessageFormValues = z.infer<typeof messageSchema>;

export const formatZodError = (error: z.ZodError): string => {
  return error.issues.map((e: any) => e.message).join(', ');
};
