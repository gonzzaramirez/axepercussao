/*
  Warnings:

  - The values [PERCUSSION,SPARE_PART] on the enum `product_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `flavor_id` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `flavor_name` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `size_name` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the `product_flavors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_sizes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "instrument_register" AS ENUM ('AGUDO', 'MEDIO', 'GRAVE');

-- AlterEnum: mapear PERCUSSION->INSTRUMENT, SPARE_PART->ACCESSORY
BEGIN;
CREATE TYPE "product_type_new" AS ENUM ('INSTRUMENT', 'ACCESSORY');
ALTER TABLE "public"."products" ALTER COLUMN "product_type" DROP DEFAULT;
ALTER TABLE "products" ALTER COLUMN "product_type" TYPE "product_type_new" USING (
  CASE "product_type"::text
    WHEN 'PERCUSSION' THEN 'INSTRUMENT'::product_type_new
    WHEN 'SPARE_PART' THEN 'ACCESSORY'::product_type_new
    ELSE 'ACCESSORY'::product_type_new
  END
);
ALTER TYPE "product_type" RENAME TO "product_type_old";
ALTER TYPE "product_type_new" RENAME TO "product_type";
DROP TYPE "public"."product_type_old";
ALTER TABLE "products" ALTER COLUMN "product_type" SET DEFAULT 'INSTRUMENT';
COMMIT;

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_flavor_id_fkey";

-- DropForeignKey
ALTER TABLE "product_flavors" DROP CONSTRAINT IF EXISTS "product_flavors_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_sizes" DROP CONSTRAINT IF EXISTS "product_sizes_product_id_fkey";

-- AlterTable: categories - agregar slug de forma segura para filas existentes
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "image_url" TEXT;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "sort_order" INTEGER NOT NULL DEFAULT 0;
UPDATE "categories" SET "slug" = 'cat-' || id WHERE "slug" IS NULL;
ALTER TABLE "categories" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN IF EXISTS "flavor_id",
DROP COLUMN IF EXISTS "flavor_name",
DROP COLUMN IF EXISTS "size_name",
ADD COLUMN IF NOT EXISTS "brand_name" TEXT,
ADD COLUMN IF NOT EXISTS "variant_desc" TEXT,
ADD COLUMN IF NOT EXISTS "variant_id" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "instrument_register" "instrument_register",
ADD COLUMN IF NOT EXISTS "short_description" TEXT;
ALTER TABLE "products" ALTER COLUMN "product_type" SET DEFAULT 'INSTRUMENT';

-- DropTable
DROP TABLE IF EXISTS "product_flavors";
DROP TABLE IF EXISTS "product_sizes";

-- CreateTable
CREATE TABLE IF NOT EXISTS "brands" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_url" TEXT,
    "website" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_variants" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "brand_id" INTEGER,
    "sku" TEXT NOT NULL,
    "size" TEXT,
    "model" TEXT,
    "material" TEXT,
    "price" INTEGER,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "brands_name_key" ON "brands"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "brands_slug_key" ON "brands"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "product_variants_sku_key" ON "product_variants"("sku");
CREATE UNIQUE INDEX IF NOT EXISTS "product_variants_product_id_brand_id_size_model_material_key" ON "product_variants"("product_id", "brand_id", "size", "model", "material");
CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_key" ON "categories"("slug");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_variants_product_id_fkey'
  ) THEN
    ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" 
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_variants_brand_id_fkey'
  ) THEN
    ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_brand_id_fkey" 
    FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'order_items_variant_id_fkey'
  ) THEN
    ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_fkey" 
    FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
