'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Store, Truck, CreditCard, Bell, Users, Save, ExternalLink, Palette } from 'lucide-react'
import { useThemeStore, type ThemeMode } from '@/lib/store/theme'

export default function SettingsPage() {
  const [storeSettings, setStoreSettings] = useState({
    name: 'UltraRareLove',
    email: 'hello@ultrararelove.com',
    phone: '+1 (555) 123-4567',
    address: '123 Love Lane, Valentine City, VC 12345',
    description: 'Premium holographic Valentine\'s cards that capture your love in a collectible that lasts forever.',
  })

  const [notifications, setNotifications] = useState({
    orderConfirmation: true,
    shippingUpdates: true,
    lowStock: true,
    newCustomer: false,
    weeklyReport: true,
  })

  const { themeMode, setThemeMode } = useThemeStore()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your store settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-3">
        <TabsList className="bg-muted">
          <TabsTrigger value="general" className="gap-2">
            <Store className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="shipping" className="gap-2">
            <Truck className="h-4 w-4" />
            Shipping
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Store Information</CardTitle>
              <CardDescription>Basic information about your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Store Name</label>
                  <Input
                    value={storeSettings.name}
                    onChange={(e) => setStoreSettings({...storeSettings, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Contact Email</label>
                  <Input
                    type="email"
                    value={storeSettings.email}
                    onChange={(e) => setStoreSettings({...storeSettings, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone Number</label>
                  <Input
                    value={storeSettings.phone}
                    onChange={(e) => setStoreSettings({...storeSettings, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Business Address</label>
                  <Input
                    value={storeSettings.address}
                    onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Store Description</label>
                <Textarea
                  value={storeSettings.description}
                  onChange={(e) => setStoreSettings({...storeSettings, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <Button className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping" className="space-y-3">
          {/* Free Shipping Promotion */}
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Truck className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base text-emerald-800">Free Shipping Promotion</CardTitle>
                  <CardDescription className="text-emerald-600">Active for orders $35.00 and above</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg p-4 border border-emerald-200">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Threshold</p>
                    <p className="text-2xl font-bold text-emerald-600">$35.00</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</p>
                    <Badge className="bg-emerald-100 text-emerald-700 mt-1">Active</Badge>
                  </div>
                </div>
                <Separator className="my-3" />
                <p className="text-sm text-muted-foreground">
                  When cart subtotal is <span className="font-medium text-foreground">$35.00 or more</span>, customers get FREE Standard Shipping and Express Shipping at a reduced rate of $4.95.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Rates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipping Rates</CardTitle>
              <CardDescription>Rates applied based on cart value</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Under threshold */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Orders under $35.00</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Standard Shipping</p>
                      <p className="text-sm text-muted-foreground">5-7 business days</p>
                    </div>
                    <p className="font-semibold text-foreground">$4.95</p>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Express Shipping</p>
                      <p className="text-sm text-muted-foreground">1-3 business days</p>
                    </div>
                    <p className="font-semibold text-foreground">$9.95</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Over threshold */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Orders $35.00 and above</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border border-emerald-200 bg-emerald-50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Standard Shipping</p>
                      <p className="text-sm text-muted-foreground">5-7 business days</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700">FREE</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Express Shipping</p>
                      <p className="text-sm text-muted-foreground">1-3 business days</p>
                    </div>
                    <p className="font-semibold text-foreground">$4.95</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Zones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipping Zones</CardTitle>
              <CardDescription>Countries where you ship to</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="px-3 py-1">
                  <span className="mr-1">🇺🇸</span> United States
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <span className="mr-1">🇨🇦</span> Canada
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <span className="mr-1">🇬🇧</span> United Kingdom
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <span className="mr-1">🇦🇺</span> Australia
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Provider</CardTitle>
              <CardDescription>Manage your payment processing settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#635BFF] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Stripe</p>
                    <p className="text-sm text-muted-foreground">Connected • Test mode</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-100 text-amber-700">Test Mode</Badge>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Accept credit cards</p>
                    <p className="text-xs text-muted-foreground">Visa, Mastercard, American Express</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Apple Pay</p>
                    <p className="text-xs text-muted-foreground">Allow customers to pay with Apple Pay</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Google Pay</p>
                    <p className="text-xs text-muted-foreground">Allow customers to pay with Google Pay</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Notifications</CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Order confirmations</p>
                    <p className="text-xs text-muted-foreground">Receive an email when a new order is placed</p>
                  </div>
                  <Switch
                    checked={notifications.orderConfirmation}
                    onCheckedChange={(checked) => setNotifications({...notifications, orderConfirmation: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Shipping updates</p>
                    <p className="text-xs text-muted-foreground">Get notified when orders are shipped or delivered</p>
                  </div>
                  <Switch
                    checked={notifications.shippingUpdates}
                    onCheckedChange={(checked) => setNotifications({...notifications, shippingUpdates: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Low stock alerts</p>
                    <p className="text-xs text-muted-foreground">Get notified when product stock is running low</p>
                  </div>
                  <Switch
                    checked={notifications.lowStock}
                    onCheckedChange={(checked) => setNotifications({...notifications, lowStock: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">New customer signups</p>
                    <p className="text-xs text-muted-foreground">Get notified when a new customer registers</p>
                  </div>
                  <Switch
                    checked={notifications.newCustomer}
                    onCheckedChange={(checked) => setNotifications({...notifications, newCustomer: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Weekly performance report</p>
                    <p className="text-xs text-muted-foreground">Receive a weekly summary of your store&apos;s performance</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReport}
                    onCheckedChange={(checked) => setNotifications({...notifications, weeklyReport: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Settings */}
        <TabsContent value="users" className="space-y-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Team Members</CardTitle>
                  <CardDescription>Manage who has access to your admin</CardDescription>
                </div>
                <Button className="bg-primary hover:bg-primary/90">
                  Invite member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-medium">
                      AT
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Admin User</p>
                      <p className="text-sm text-muted-foreground">admin@ultrararelove.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>Owner</Badge>
                    <Button variant="ghost" size="sm" disabled>Remove</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Store Theme</CardTitle>
              <CardDescription>Choose your storefront color scheme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Pink Theme Option */}
                <button
                  onClick={() => setThemeMode('pink')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    themeMode === 'pink'
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-border hover:border-pink-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-400 to-pink-600" />
                    <div>
                      <p className="font-medium text-foreground">Pink</p>
                      <p className="text-xs text-muted-foreground">Default theme</p>
                    </div>
                    {themeMode === 'pink' && (
                      <Badge className="ml-auto bg-pink-500">Active</Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <div className="w-6 h-6 rounded bg-pink-50 border border-pink-100" title="pink-50" />
                    <div className="w-6 h-6 rounded bg-pink-100" title="pink-100" />
                    <div className="w-6 h-6 rounded bg-pink-200" title="pink-200" />
                    <div className="w-6 h-6 rounded bg-pink-400" title="pink-400" />
                    <div className="w-6 h-6 rounded bg-pink-500" title="pink-500" />
                    <div className="w-6 h-6 rounded bg-pink-600" title="pink-600" />
                  </div>
                </button>

                {/* Red Valentine Theme Option */}
                <button
                  onClick={() => setThemeMode('red')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    themeMode === 'red'
                      ? 'border-red-500 bg-red-50'
                      : 'border-border hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-400 to-red-600" />
                    <div>
                      <p className="font-medium text-foreground">Red Valentine</p>
                      <p className="text-xs text-muted-foreground">Valentine&apos;s Day special</p>
                    </div>
                    {themeMode === 'red' && (
                      <Badge className="ml-auto bg-red-500">Active</Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <div className="w-6 h-6 rounded bg-red-50 border border-red-100" title="red-50" />
                    <div className="w-6 h-6 rounded bg-red-100" title="red-100" />
                    <div className="w-6 h-6 rounded bg-red-200" title="red-200" />
                    <div className="w-6 h-6 rounded bg-red-400" title="red-400" />
                    <div className="w-6 h-6 rounded bg-red-500" title="red-500" />
                    <div className="w-6 h-6 rounded bg-red-600" title="red-600" />
                  </div>
                </button>
              </div>

              <Separator />

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> Theme changes apply instantly to your storefront.
                  The admin dashboard colors remain unchanged for consistency.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
