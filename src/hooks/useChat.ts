import { useState, useCallback } from 'react'
import { simulateResponse } from '../api/chat'
import type { Message } from '../api/chat.types'
import { isUserMessage } from '../api/chat.types'
import type { GithubProfile, ContributionData } from '../api/github.types'
import { createMessageId } from '../lib/ids'

export function useChat(profile: GithubProfile | undefined, contributions: ContributionData) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      const userMsgId = createMessageId()

      const userMsg: Message = {
        id: userMsgId,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])
      setIsTyping(true)

      try {
        const response = await simulateResponse(
          content,
          profile ?? {
            login: '',
            name: '',
            avatarUrl: '',
            bio: null,
            publicRepos: 0,
            followers: 0,
            following: 0,
            stars: 0,
            company: null,
            location: null,
            pronouns: null,
            createdAt: '',
          },
          contributions,
        )
        const assistantMsg: Message = {
          id: createMessageId(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMsg])
      } catch (_error) {
      } finally {
        setIsTyping(false)
      }
    },
    [profile, contributions],
  )

  const regenerateLastMessage = useCallback(async () => {
    setMessages((prev) => {
      const lastAssistantIndex = [...prev].reverse().findIndex((m) => m.role === 'assistant')
      if (lastAssistantIndex === -1) return prev
      return prev.slice(0, prev.length - 1 - lastAssistantIndex)
    })

    // Re-send the last user message
    setMessages((prev) => {
      const lastUserMsg = [...prev].reverse().find(isUserMessage)
      if (!lastUserMsg) return prev

      setIsTyping(true)
      simulateResponse(
        lastUserMsg.content,
        profile ?? {
          login: '',
          name: '',
          avatarUrl: '',
          bio: null,
          publicRepos: 0,
          followers: 0,
          following: 0,
          stars: 0,
          company: null,
          location: null,
          pronouns: null,
          createdAt: '',
        },
        contributions,
      )
        .then((response) => {
          const assistantMsg: Message = {
            id: createMessageId(),
            role: 'assistant',
            content: response,
            timestamp: new Date(),
          }
          setMessages((p) => [...p, assistantMsg])
        })
        .finally(() => {
          setIsTyping(false)
        })

      return prev
    })
  }, [profile, contributions])

  return { messages, isTyping, sendMessage, regenerateLastMessage }
}
