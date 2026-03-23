import { z } from 'zod'

const MessageBaseSchema = z.object({
  id: z.string(),
  content: z.string(),
  timestamp: z.date(),
})

export const UserMessageSchema = MessageBaseSchema.extend({
  role: z.literal('user'),
})

export const AssistantMessageSchema = MessageBaseSchema.extend({
  role: z.literal('assistant'),
})

export const MessageSchema = z.discriminatedUnion('role', [UserMessageSchema, AssistantMessageSchema])
