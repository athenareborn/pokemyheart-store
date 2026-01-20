import { NextRequest, NextResponse } from 'next/server'
import { getProducts, createProduct, generateSlug } from '@/lib/db/products'
import type { ProductStatus, ProductInsert } from '@/lib/supabase/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as ProductStatus | null
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')
    const search = searchParams.get('search')

    const { products, count, error } = await getProducts({
      status: status || undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      search: search || undefined,
    })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    return NextResponse.json({ products, count })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description, short_description, price, compare_at_price, images, designs, stock, status, sku } = body as ProductInsert

    if (!name) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      )
    }

    if (price === undefined || price < 0) {
      return NextResponse.json(
        { error: 'Valid price is required' },
        { status: 400 }
      )
    }

    const productSlug = slug || generateSlug(name)

    const { product, error } = await createProduct({
      name,
      slug: productSlug,
      description: description || null,
      short_description: short_description || null,
      price,
      compare_at_price: compare_at_price || null,
      images: images || [],
      designs: designs || [],
      stock: stock ?? 0,
      status: status || 'draft',
      sku: sku || null,
    })

    if (error) {
      // Check for unique constraint violation (duplicate slug)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A product with this slug already exists' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      )
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
