import { create } from "zustand"
import { api } from "./api"
import * as Types from "@/types/api"

export interface ChatMessage {
  role: "user" | "ai"
  text: string
  suggestions?: Types.DocumentChatSuggestion[]
}

interface ChatStore {
  isOpen: boolean
  isLoading: boolean
  activeDocumentId: string | null
  messages: Record<string, ChatMessage[]>
  suggestions: Record<string, Types.DocumentChatSuggestion[]>
  
  setIsOpen: (isOpen: boolean) => void
  setActiveDocumentId: (id: string | null) => void
  setLoading: (loading: boolean) => void
  clearChat: (documentId: string) => void
  sendMessage: (documentId: string, text: string) => Promise<void>
}

export const useChatStore = create<ChatStore>((set, get) => ({
  isOpen: false,
  isLoading: false,
  activeDocumentId: null,
  messages: {},
  suggestions: {},

  setIsOpen: (isOpen) => set({ isOpen }),
  setActiveDocumentId: (id) => set({ activeDocumentId: id }),
  setLoading: (loading) => set({ isLoading: loading }),

  clearChat: (documentId) => set((state) => ({
    messages: {
      ...state.messages,
      [documentId]: []
    },
    suggestions: {
      ...state.suggestions,
      [documentId]: []
    }
  })),

  sendMessage: async (documentId, text) => {
    const userMessage: ChatMessage = { role: "user", text }
    
    // Optimistic append for user message
    set((state) => {
      const currentMsgs = state.messages[documentId] || []
      return {
        messages: {
          ...state.messages,
          [documentId]: [...currentMsgs, userMessage]
        },
        suggestions: {
          ...state.suggestions,
          [documentId]: []
        },
        isLoading: true
      }
    })

    try {
      const res = await api.chatWithDocs(documentId, text)
      const aiText = res.response || (res as any).answer || "I'm sorry, I couldn't process that."
      const newSuggestions = res.suggestions || []

      const aiMessage: ChatMessage = { 
        role: "ai", 
        text: aiText, 
        suggestions: newSuggestions 
      }

      set((state) => {
        const currentMsgs = state.messages[documentId] || []
        return {
          messages: {
            ...state.messages,
            [documentId]: [...currentMsgs, aiMessage]
          },
          suggestions: {
            ...state.suggestions,
            [documentId]: newSuggestions
          },
          isLoading: false
        }
      })
    } catch (err) {
      console.error("Chat API error:", err)
      const errorMessage: ChatMessage = { role: "ai", text: "Error: Failed to reach AI service." }
      
      set((state) => {
        const currentMsgs = state.messages[documentId] || []
        return {
          messages: {
            ...state.messages,
            [documentId]: [...currentMsgs, errorMessage]
          },
          isLoading: false
        }
      })
    }
  }
}))
