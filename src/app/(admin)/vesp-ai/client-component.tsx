'use client'

import { useState, useRef } from 'react'
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
import { generateImagePromptAction, type ImageFormat } from '@/app/actions/ai-actions'
import { Sparkles, Copy, Check, Upload, X, LayoutTemplate, Smartphone, Monitor } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ClientOption {
  id: string
  name: string
}

const FORMAT_OPTIONS: { value: ImageFormat; label: string; sublabel: string; icon: React.ReactNode; ratio: string }[] = [
  {
    value: 'square',
    label: 'Feed Quadrado',
    sublabel: '1:1',
    icon: <LayoutTemplate className="h-5 w-5" />,
    ratio: 'aspect-square',
  },
  {
    value: 'portrait',
    label: 'Story / Reels',
    sublabel: '9:16',
    icon: <Smartphone className="h-5 w-5" />,
    ratio: 'aspect-[9/16]',
  },
  {
    value: 'landscape',
    label: 'Banner',
    sublabel: '16:9',
    icon: <Monitor className="h-5 w-5" />,
    ratio: 'aspect-video',
  },
]

export function VespAIGenerator({ clients }: { clients: ClientOption[] }) {
  const [clientId, setClientId] = useState('')
  const [scenario, setScenario] = useState('')
  const [format, setFormat] = useState<ImageFormat>('square')
  const [referenceFile, setReferenceFile] = useState<{ name: string; base64: string } | null>(null)
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setReferenceFile({ name: file.name, base64: ev.target?.result as string })
    }
    reader.readAsDataURL(file)
  }

  const handleGenerate = async () => {
    if (!clientId) { setError('Por favor, selecione um cliente.'); return }
    if (!scenario) { setError('Por favor, descreva o que deseja promover.'); return }

    setLoading(true)
    setError(null)
    setGeneratedPrompt('')
    setCopied(false)

    const result = await generateImagePromptAction(
      clientId,
      scenario,
      format,
      referenceFile?.base64,
    )

    if (result.error) setError(result.error)
    else if (result.prompt) setGeneratedPrompt(result.prompt)

    setLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-6">
          {error && (
            <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Row 1: Client + Scenario */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>1. Selecione a Marca</Label>
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
                A IA usará o contexto da marca cadastrado no perfil.
              </p>
            </div>

            <div className="space-y-2">
              <Label>2. O que deseja promover?</Label>
              <Input
                placeholder="Ex: Fralda em promoção, foco em mães felizes..."
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
            </div>
          </div>

          {/* Row 2: Format selector */}
          <div className="space-y-2">
            <Label>3. Formato da Arte</Label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormat(opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 sm:gap-2 rounded-xl border-2 p-2 sm:p-4 transition-all hover:border-primary/60',
                    format === opt.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground',
                  )}
                >
                  {/* Visual preview box */}
                  <div className="flex items-center justify-center">
                    <div
                      className={cn(
                        'border-2 rounded-sm',
                        format === opt.value ? 'border-primary bg-primary/10' : 'border-muted-foreground/30 bg-muted/30',
                        opt.value === 'square' && 'w-10 h-10',
                        opt.value === 'portrait' && 'w-6 h-10',
                        opt.value === 'landscape' && 'w-12 h-7',
                      )}
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-[10px] sm:text-xs">{opt.label}</p>
                    <p className="text-[9px] sm:text-[11px] opacity-70">{opt.sublabel}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Reference upload */}
          <div className="space-y-2">
            <Label>4. Logo / Referência Visual <span className="text-muted-foreground font-normal">(opcional)</span></Label>
            <div
              className={cn(
                'relative flex items-center gap-3 rounded-xl border-2 border-dashed p-4 transition-colors cursor-pointer hover:border-primary/50 hover:bg-primary/5',
                referenceFile ? 'border-primary/40 bg-primary/5' : 'border-border',
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {referenceFile ? (
                <>
                  <div className="w-10 h-10 rounded-lg overflow-hidden border flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={referenceFile.base64} alt="ref" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{referenceFile.name}</p>
                    <p className="text-xs text-muted-foreground">A IA analisará as cores e estilo desta imagem</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0"
                    onClick={(e) => { e.stopPropagation(); setReferenceFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Clique para fazer upload</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WEBP — Logo, paleta de cores ou referência de estilo</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Generate button */}
          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={handleGenerate}
            disabled={loading || !clientId || !scenario}
          >
            {loading ? (
              <span className="animate-pulse flex items-center gap-2">
                <Sparkles className="h-5 w-5" /> Gerando a magia...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" /> Gerar Prompt Vesp AI
              </span>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      {generatedPrompt && (
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold text-primary flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Resultado
            </Label>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
          <Textarea
            readOnly
            value={generatedPrompt}
            className="min-h-[240px] text-sm p-4 bg-muted/50 font-mono resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Copie o prompt acima e cole no seu gerador de imagens (Midjourney, DALL-E, Firefly). Depois sobreponha a logo da marca!
          </p>
        </div>
      )}
    </div>
  )
}
