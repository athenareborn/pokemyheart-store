'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Package, Edit2, Save, Image as ImageIcon, DollarSign, Palette, Box, Plus } from 'lucide-react'
import { PRODUCT } from '@/data/product'
import { BUNDLES } from '@/data/bundles'
import { formatPrice } from '@/lib/utils'

export default function ProductsPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [product, setProduct] = useState({
    name: PRODUCT.name,
    description: PRODUCT.description,
    stockCount: PRODUCT.stockCount,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Product Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src="/images/design-1.svg"
                  alt={PRODUCT.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{PRODUCT.name}</CardTitle>
                  <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                </div>
                <CardDescription className="mt-1">
                  {PRODUCT.shortDescription}
                </CardDescription>
                <p className="text-sm text-muted-foreground mt-2">SKU: PMH-CARD • {PRODUCT.stockCount} in stock</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              <Edit2 className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="details" className="gap-2">
            <Package className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Pricing & Bundles
          </TabsTrigger>
          <TabsTrigger value="variants" className="gap-2">
            <Palette className="h-4 w-4" />
            Design Variants
          </TabsTrigger>
          <TabsTrigger value="images" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Images
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2">
            <Box className="h-4 w-4" />
            Inventory
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product Information</CardTitle>
              <CardDescription>Basic product details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Product Name</label>
                <Input
                  value={product.name}
                  onChange={(e) => setProduct({...product, name: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea
                  value={product.description}
                  onChange={(e) => setProduct({...product, description: e.target.value})}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Product Slug</label>
                  <Input value={PRODUCT.slug} disabled />
                  <p className="text-xs text-muted-foreground">Used in the product URL</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Product ID</label>
                  <Input value={PRODUCT.id} disabled />
                </div>
              </div>
              {isEditing && (
                <div className="flex justify-end">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bundle Pricing</CardTitle>
              <CardDescription>Manage your product bundles and pricing tiers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {BUNDLES.map((bundle) => (
                  <div key={bundle.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{bundle.name}</p>
                        {bundle.badge && (
                          <Badge className={bundle.badge === 'Most Popular' ? 'bg-pink-100 text-pink-700' : 'bg-emerald-100 text-emerald-700'}>
                            {bundle.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{bundle.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">SKU: {bundle.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-foreground">{formatPrice(bundle.price)}</p>
                      <p className="text-sm text-muted-foreground line-through">{formatPrice(bundle.compareAt)}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-4" disabled={!isEditing}>
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Free Shipping Threshold</p>
                    <p className="text-xs text-muted-foreground">Orders above this get free shipping</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input className="w-24" value={formatPrice(PRODUCT.freeShippingThreshold)} disabled={!isEditing} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variants Tab */}
        <TabsContent value="variants">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Design Variants</CardTitle>
                  <CardDescription>Manage the different card designs</CardDescription>
                </div>
                <Button variant="outline" disabled={!isEditing}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {PRODUCT.designs.map((design) => (
                  <div key={design.id} className="border border-border rounded-lg overflow-hidden">
                    <div className="aspect-[3/4] bg-muted relative">
                      <Image
                        src={design.image}
                        alt={design.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{design.name}</p>
                          <p className="text-xs text-muted-foreground">{design.id}</p>
                        </div>
                        <Switch defaultChecked disabled={!isEditing} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Product Gallery</CardTitle>
                  <CardDescription>Images shown on the product page</CardDescription>
                </div>
                <Button variant="outline" disabled={!isEditing}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {PRODUCT.images.map((image, index) => (
                  <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden relative group">
                    <Image
                      src={image}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {index === 0 && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-slate-900 text-white">Primary</Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inventory Management</CardTitle>
              <CardDescription>Track and manage stock levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Current Stock</p>
                  <p className="text-3xl font-semibold text-foreground mt-1">{PRODUCT.stockCount}</p>
                  <p className="text-xs text-amber-600 mt-1">Low stock</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Reserved</p>
                  <p className="text-3xl font-semibold text-foreground mt-1">2</p>
                  <p className="text-xs text-muted-foreground mt-1">In carts</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Available</p>
                  <p className="text-3xl font-semibold text-foreground mt-1">{PRODUCT.stockCount - 2}</p>
                  <p className="text-xs text-muted-foreground mt-1">For sale</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Track inventory</p>
                    <p className="text-xs text-muted-foreground">Keep track of stock levels</p>
                  </div>
                  <Switch defaultChecked disabled={!isEditing} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Continue selling when out of stock</p>
                    <p className="text-xs text-muted-foreground">Allow customers to purchase even when stock is zero</p>
                  </div>
                  <Switch disabled={!isEditing} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Low stock threshold</p>
                    <p className="text-xs text-muted-foreground">Get notified when stock drops below this level</p>
                  </div>
                  <Input className="w-20" defaultValue="10" disabled={!isEditing} />
                </div>
              </div>

              {isEditing && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Adjust Stock</label>
                    <div className="flex gap-2">
                      <Input placeholder="Enter quantity" className="w-32" />
                      <Button variant="outline">Add stock</Button>
                      <Button variant="outline">Remove stock</Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
