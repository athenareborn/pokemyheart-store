'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Package,
  DollarSign,
  Image as ImageIcon,
  Settings,
} from 'lucide-react'
import type { ProductStatus, ProductInsert } from '@/lib/supabase/types'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function NewProductPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<ProductInsert>({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: 0,
    compare_at_price: null,
    images: [],
    designs: [],
    stock: 0,
    status: 'draft',
    sku: '',
  })

  const [priceDisplay, setPriceDisplay] = useState('')
  const [compareAtPriceDisplay, setCompareAtPriceDisplay] = useState('')

  function handleNameChange(name: string) {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }))
  }

  function handlePriceChange(value: string) {
    setPriceDisplay(value)
    const cents = Math.round(parseFloat(value || '0') * 100)
    setFormData(prev => ({ ...prev, price: isNaN(cents) ? 0 : cents }))
  }

  function handleCompareAtPriceChange(value: string) {
    setCompareAtPriceDisplay(value)
    if (!value) {
      setFormData(prev => ({ ...prev, compare_at_price: null }))
      return
    }
    const cents = Math.round(parseFloat(value) * 100)
    setFormData(prev => ({ ...prev, compare_at_price: isNaN(cents) ? null : cents }))
  }

  function handleImagesChange(value: string) {
    const images = value.split('\n').map(url => url.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, images }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Product name is required')
      return
    }

    if (formData.price <= 0) {
      setError('Price must be greater than 0')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: formData.slug || generateSlug(formData.name),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create product')
      }

      router.push('/admin/products')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">New Product</h1>
            <p className="text-sm text-muted-foreground">Create a new product in your catalog</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Product
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">Basic Information</CardTitle>
              </div>
              <CardDescription>Enter the product details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Premium Valentine's Card"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="auto-generated-from-name"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly identifier. Auto-generated from name if left empty.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Input
                  id="short_description"
                  placeholder="Brief product summary"
                  value={formData.short_description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed product description..."
                  rows={5}
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">Pricing</CardTitle>
              </div>
              <CardDescription>Set the product pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="pl-7"
                      value={priceDisplay}
                      onChange={(e) => handlePriceChange(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compare_at_price">Compare at Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="compare_at_price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="pl-7"
                      value={compareAtPriceDisplay}
                      onChange={(e) => handleCompareAtPriceChange(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Original price to show as crossed out
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">Images</CardTitle>
              </div>
              <CardDescription>Add product images (one URL per line)</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="/images/product-1.jpg&#10;/images/product-2.jpg&#10;/images/product-3.jpg"
                rows={4}
                value={formData.images?.join('\n') || ''}
                onChange={(e) => handleImagesChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Enter image URLs, one per line. The first image will be used as the primary image.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Product Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: ProductStatus) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Draft products are not visible on the storefront
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  placeholder="e.g., PMH-CARD-001"
                  value={formData.sku || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stock || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-medium text-sm mb-3">Summary</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium">{formData.name || '-'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Price</dt>
                  <dd className="font-medium">
                    {formData.price > 0 ? `$${(formData.price / 100).toFixed(2)}` : '-'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Stock</dt>
                  <dd className="font-medium">{formData.stock || 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-medium capitalize">{formData.status}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
