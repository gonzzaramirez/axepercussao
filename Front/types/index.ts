export type Category = "surdo" | "repique" | "tamborim" | "chocalho" | "accesorio"

export type Brand = "Gope" | "Ivsom" | "Contemporanea"

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  category: Category
  brand: Brand
  price: number
  image: string
  featured?: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}
