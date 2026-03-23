import { z } from 'zod';
import {
  UserMessageSchema,
  AssistantMessageSchema,
  MessageSchema,
} from './chat.schemas';

export type UserMessage = z.infer<typeof UserMessageSchema>;
export type AssistantMessage = z.infer<typeof AssistantMessageSchema>;
export type Message = z.infer<typeof MessageSchema>;

export function isUserMessage(message: Message): message is UserMessage {
  return message.role === 'user';
}

export function isAssistantMessage(message: Message): message is UserMessage {
  return message.role === 'assistant';
}
