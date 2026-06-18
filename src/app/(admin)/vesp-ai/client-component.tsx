'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { generateImagePromptAction } from '@/app/actions/ai-actions'
import { Sparkles, Copy, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface ClientOption {
  id: string
  name: string
}

export function VespAIGenerator({ clients }: { clients: ClientOption[] }) {
  const [clientId, setClientId] = useState('')
  const [scenario, setScenario] = useState('')
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!clientId) {
      setError('Por favor, selecione um cliente.')
      return
    }
    if (!scenario) {
      setError('Por favor, descreva o que deseja promover.')
      return
    }

    setLoading(true)
    setError(null)
    setGeneratedPrompt('')
    setCopied(false)

    const result = await generateImagePromptAction(clientId, scenario)

    if (result.error) {
      setError(result.error)
    } else if (result.prompt) {
      setGeneratedPrompt(result.prompt)
    }
    
    setLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6 space-y-6">
          {error && <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="client_id">1. Selecione a Marca (Cliente)</Label>
              <Select value={clientId} onValueChange={(v) => setClientId(v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha o cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                A IA usará o "Contexto Vesp AI" cadastrado neste perfil.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scenario">2. O que deseja promover?</Label>
              <Input 
                id="scenario" 
                placeholder="Ex: Fralda em promoção, Foco em mães felizes..." 
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
            </div>
          </div>

          <Button 
            className="w-full h-12 text-lg" 
            onClick={handleGenerate} 
            disabled={loading || !clientId || !scenario}
          >
            {loading ? (
              <span className="animate-pulse flex items-center">
                <Sparkles className="mr-2 h-5 w-5" /> Gerando a magia...
              </span>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" /> Gerar Prompt Vesp AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedPrompt && (
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold text-primary flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> Resultado Final
            </Label>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copiado!' : 'Copiar Prompt'}
            </Button>
          </div>
          <Textarea 
            readOnly 
            value={generatedPrompt} 
            className="min-h-[200px] text-base p-4 bg-muted/50 font-mono resize-none"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Copie o texto acima e cole no seu gerador de imagens favorito (Midjourney, DALL-E, etc), depois basta sobrepor a logo da marca!
          </p>
        </div>
      )}
    </div>
  )
}
