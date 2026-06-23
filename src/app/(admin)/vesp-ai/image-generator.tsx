'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { generateImageAction, type ImageFormat } from '@/app/actions/ai-actions'
import { Sparkles, Download, Upload, X, ImageIcon, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ClientOption {
  id: string
  name: string
  company?: string
}

const FORMAT_OPTIONS: { value: ImageFormat; label: string; sublabel: string; preview: string }[] = [
  { value: 'square',    label: 'Feed Quadrado', sublabel: '1:1 · 1024×1024',   preview: 'w-10 h-10' },
  { value: 'portrait',  label: 'Story / Reels', sublabel: '9:16 · 1024×1792',  preview: 'w-6 h-10' },
  { value: 'landscape', label: 'Banner',         sublabel: '16:9 · 1792×1024',  preview: 'w-12 h-7' },
]

export function ImageGenerator({ clients }: { clients: ClientOption[] }) {
  const [clientId, setClientId] = useState('')
  const [prompt, setPrompt] = useState('')
  const [format, setFormat] = useState<ImageFormat>('square')
  const [referenceFile, setReferenceFile] = useState<{ name: string; base64: string } | null>(null)
  const [result, setResult] = useState<{ imageUrl: string; revisedPrompt?: string } | null>(null)
  const [loading, setLoading] = useState(false)
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
    if (!clientId) { setError('Selecione um cliente.'); return }
    if (!prompt.trim()) { setError('Descreva o que deseja gerar.'); return }

    setLoading(true)
    setError(null)
    setResult(null)

    const res = await generateImageAction({
      clientId,
      promptText: prompt,
      format,
      referenceImageBase64: referenceFile?.base64,
    })

    if (res.error) {
      setError(res.error)
    } else if (res.imageUrl) {
      setResult({ imageUrl: res.imageUrl, revisedPrompt: res.revisedPrompt })
    }

    setLoading(false)
  }

  const handleDownload = async () => {
    if (!result?.imageUrl) return
    const a = document.createElement('a')
    a.href = result.imageUrl
    a.download = `vesp-ai-${format}-${Date.now()}.png`
    a.target = '_blank'
    a.click()
  }

  return (
    <div className="grid md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_420px] gap-6">
      {/* Left — controls */}
      <div className="space-y-5">
        <Card>
          <CardContent className="p-6 space-y-5">
            {error && (
              <div className="flex items-start gap-2 text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Client */}
            <div className="space-y-2">
              <Label>Marca / Cliente</Label>
              <Select value={clientId} onValueChange={(v) => setClientId(v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}{c.company ? ` — ${c.company}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <Label>Descrição / Briefing</Label>
              <Textarea
                placeholder="Descreva o que deseja gerar. Ex: Flyer promocional de dia das mães com produto em destaque, cores quentes, fundo degradê roxo e rosa..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                A IA irá refinar seu briefing e gerar o prompt técnico para o DALL-E 3 automaticamente.
              </p>
            </div>

            {/* Format */}
            <div className="space-y-2">
              <Label>Formato</Label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {FORMAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormat(opt.value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 sm:gap-2 rounded-xl border-2 p-2 sm:p-3 transition-all hover:border-primary/60',
                      format === opt.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-muted-foreground',
                    )}
                  >
                    <div
                      className={cn(
                        'border-2 rounded-sm',
                        format === opt.value ? 'border-primary bg-primary/10' : 'border-muted-foreground/30 bg-muted/30',
                        opt.preview,
                      )}
                    />
                    <div className="text-center">
                      <p className="font-medium text-[10px] sm:text-xs leading-tight">{opt.label}</p>
                      <p className="text-[9px] sm:text-[10px] opacity-60 leading-tight">{opt.sublabel}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reference upload */}
            <div className="space-y-2">
              <Label>
                Logo / Referência Visual{' '}
                <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-xl border-2 border-dashed p-4 cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/5',
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
                      <p className="text-xs text-muted-foreground">A IA analisa cores e estilo</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        setReferenceFile(null)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
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
                      <p className="text-sm font-medium">Upload de referência</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, WEBP · Logo, paleta ou moodboard</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <Button
              className="w-full h-12 text-base font-semibold"
              onClick={handleGenerate}
              disabled={loading || !clientId || !prompt.trim()}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> Gerando imagem...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> Gerar Imagem com IA
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right — result */}
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-4 h-80 bg-muted/20">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Gerando sua arte...</p>
                  <p className="text-sm text-muted-foreground">Isso pode levar até 30 segundos</p>
                </div>
              </div>
            ) : result ? (
              <div className="animate-in fade-in duration-500">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.imageUrl}
                  alt="Arte gerada pela IA"
                  className="w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 h-80 bg-muted/10 text-muted-foreground">
                <ImageIcon className="h-12 w-12 opacity-30" />
                <p className="text-sm text-center px-6">
                  Preencha as informações ao lado e clique em &quot;Gerar Imagem&quot; para criar sua arte.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <Button className="w-full gap-2" variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4" /> Baixar Imagem
            </Button>
            {result.revisedPrompt && (
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground transition-colors">
                  Ver prompt técnico usado pelo DALL-E
                </summary>
                <p className="mt-2 p-3 bg-muted/50 rounded-lg leading-relaxed">{result.revisedPrompt}</p>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
