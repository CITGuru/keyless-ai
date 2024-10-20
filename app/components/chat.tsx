'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { SendIcon, UserIcon } from 'lucide-react'

type Message = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

type PreviewButton = {
  text: string
  action: () => void
}

export default function CustomChatbot({
  previewButtons = [],
  onSubmit,
  onSignatureRequest
}: {
  previewButtons?: PreviewButton[]
  onSubmit: (message: string) => Promise<string>
  onSignatureRequest: () => Promise<string>
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() === '') return

    setIsLoading(true)
    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      const response = await onSubmit(input)
      const botMessage: Message = { role: 'assistant', content: response }
      setMessages(prev => [...prev, botMessage])

      // Check if we need to request a signature
      if (response.includes('[SIGNATURE_REQUIRED]')) {
        const signature = await onSignatureRequest()
        const signatureMessage: Message = { role: 'system', content: `Signature received: ${signature}` }
        setMessages(prev => [...prev, signatureMessage])
      }
    } catch (error) {
      console.error('Error in chat submission:', error)
      const errorMessage: Message = { role: 'system', content: 'An error occurred. Please try again.' }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <ScrollArea className="h-[600px] pr-4" ref={scrollAreaRef}>
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`flex items-start ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{message.role === 'user' ? 'U' : 'A'}</AvatarFallback>
                  <AvatarImage src={message.role === 'user' ? '/user-avatar.png' : '/assistant-avatar.png'} />
                </Avatar>
                <div className={`mx-2 p-3 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {message.content}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
        {messages.length === 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {previewButtons.map((button, index) => (
              <Button key={index} variant="outline" onClick={button.action}>
                {button.text}
              </Button>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-4 flex items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            <SendIcon className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}