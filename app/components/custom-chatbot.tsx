'use client'

import React from 'react'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { SendIcon, UserIcon, EyeIcon, PenIcon } from 'lucide-react'

type Message = {
  role: 'user' | 'assistant' | 'system'
  content: string
  showButtons?: boolean
}

type PreviewButton = {
  text: string
  action: () => void
}

export default function CustomChatbot({
  previewButtons = [],
  onSubmit,
  onSignatureRequest,
  onViewTransaction,
}: {
  previewButtons?: PreviewButton[]
  onSubmit: (message: string) => Promise<string>
  onSignatureRequest: () => Promise<string>
  onViewTransaction: () => void
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (input.trim() === '' || isLoading) return

    setIsLoading(true)
    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])

    try {
      const response = await onSubmit(input)
      if (response) {
        const botMessage: Message = { 
          role: 'assistant', 
          content: response,
          showButtons: true // Add this flag to show buttons
        }
        setMessages(prev => [...prev, botMessage])
      }
    } catch (error) {
      console.error('Error in chat submission:', error)
      const errorMessage: Message = { 
        role: 'system', 
        content: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setInput('')
      setIsLoading(false)
    }
  }

  const handleButtonClick = (buttonText: string) => {
    setInput(buttonText.trim())
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <Card className="w-[1000px] min-w-2xl max-w-2xl mx-auto">
      <CardContent className="p-6">
        <ScrollArea className="h-[600px] pr-4 w-full" ref={scrollAreaRef}>
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`flex items-start ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{message.role === 'user' ? 'U' : 'A'}</AvatarFallback>
                  <AvatarImage src={message.role === 'user' ? '/user-avatar.png' : '/assistant-avatar.png'} />
                </Avatar>
                <div className={`mx-2 p-3 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {message.content}
                  {message.showButtons && (
                    <div className="mt-2 flex space-x-2">
                      <Button size="sm" onClick={onViewTransaction}>
                        <EyeIcon className="w-4 h-4 mr-2" /> View
                      </Button>
                      <Button size="sm" onClick={onSignatureRequest}>
                        <PenIcon className="w-4 h-4 mr-2" /> Sign
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
        {messages.length === 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {previewButtons.map((button, index) => (
              <Button 
                key={index} 
                variant="outline" 
                onClick={() => handleButtonClick(button.text)}
                className="mb-2"
              >
                {button.text}
              </Button>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-4 flex items-center space-x-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            disabled={isLoading}
            className="flex-grow"
          />
          <Button 
            type="submit"
            disabled={isLoading} 
            className="flex-shrink-0"
          >
            <SendIcon className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
