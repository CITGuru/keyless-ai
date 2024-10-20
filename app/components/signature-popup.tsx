import React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

export default function SignaturePopup({ isOpen, onClose, onSign }: {
  isOpen: boolean
  onClose: () => void
  onSign: (signature: string) => void
}) {
  const [signature, setSignature] = useState('')

  const handleSign = () => {
    onSign(signature)
    setSignature('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to sign this transaction? This action cannot be undone.</DialogTitle>
        </DialogHeader>
        {/* <Input
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Enter your signature"
        /> */}
        <DialogFooter>
          <Button onClick={handleSign}>Sign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}