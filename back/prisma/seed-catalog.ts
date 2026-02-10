import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL no está definida. Verificá el archivo .env');
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ─── Helpers ─────────────────────────────────────────────

function slug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** SKU único para producto (usa slug para garantizar unicidad) */
function productSku(productName: string): string {
  return slug(productName).toUpperCase().replace(/-/g, '-');
}

/** SKU para variante (producto + marca + tamaño + modelo + material) */
function variantSku(...parts: string[]): string {
  return parts
    .map((p) =>
      p
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z0-9]+/g, '')
        .slice(0, 6),
    )
    .filter(Boolean)
    .join('-');
}

// ─── Datos del catálogo ──────────────────────────────────

const BRANDS_DATA = [
  { name: 'Gope', slug: 'gope' },
  { name: 'IVSOM', slug: 'ivsom' },
  { name: 'Contemporânea', slug: 'contemporanea' },
  { name: 'King', slug: 'king' },
  { name: 'Redenção', slug: 'redencao' },
  { name: 'Izzo', slug: 'izzo' },
];

const CATEGORIES_DATA = [
  // Instrumentos
  { name: 'Agudos', slug: 'agudos', description: 'Instrumentos de registro agudo', sortOrder: 1 },
  { name: 'Medios', slug: 'medios', description: 'Instrumentos de registro medio', sortOrder: 2 },
  { name: 'Graves', slug: 'graves', description: 'Instrumentos de registro grave', sortOrder: 3 },
  // Accesorios
  { name: 'Parches', slug: 'parches', description: 'Parches de plástico, cuero y cuica', sortOrder: 4 },
  { name: 'Baquetas y Palillos', slug: 'baquetas-y-palillos', description: 'Baquetas, palillos y mazos', sortOrder: 5 },
  { name: 'Correas', slug: 'correas', description: 'Correas, gorgurão y bordão', sortOrder: 6 },
  { name: 'Tensores y Llaves', slug: 'tensores-y-llaves', description: 'Tensores, varillas y llaves de afinación', sortOrder: 7 },
  { name: 'Fundas', slug: 'fundas', description: 'Fundas para todos los instrumentos', sortOrder: 8 },
];

// Tipos de datos para el catálogo
interface VariantDef {
  brands: string[];
  sizes?: string[];
  models?: string[];
  materials?: string[];
}

interface ProductDef {
  name: string;
  description: string;
  shortDescription: string;
  categorySlug: string;
  productType: 'INSTRUMENT' | 'ACCESSORY';
  instrumentRegister?: 'AGUDO' | 'MEDIO' | 'GRAVE';
  isFeatured?: boolean;
  variants: VariantDef;
}

const PRODUCTS: ProductDef[] = [
  // ═══════════════════════════════════════════════════════
  // INSTRUMENTOS — AGUDOS
  // ═══════════════════════════════════════════════════════
  {
    name: 'Repique',
    description:
      'Repique de aluminio con herrajes cromados. Sonido brillante y penetrante, ideal para breaks, repicadas y telecoteco. El instrumento insignia de la línea de agudos.',
    shortDescription: 'Repique de aluminio con herrajes cromados',
    categorySlug: 'agudos',
    productType: 'INSTRUMENT',
    instrumentRegister: 'AGUDO',
    isFeatured: true,
    variants: {
      brands: ['Gope', 'IVSOM', 'Izzo', 'Contemporânea', 'Redenção'],
      sizes: ['12"', '14"', '16"', '18"'],
    },
  },
  {
    name: 'Tamborim',
    description:
      'Tamborim profesional con aro resistente y parche de plástico. Ataque definido y cortante para swings, telecoteco y carretilla. Esencial en toda batería de samba.',
    shortDescription: 'Tamborim profesional de percusión brasileña',
    categorySlug: 'agudos',
    productType: 'INSTRUMENT',
    instrumentRegister: 'AGUDO',
    isFeatured: true,
    variants: {
      brands: ['Gope', 'IVSOM', 'Contemporânea', 'King', 'Redenção', 'Izzo'],
    },
  },
  {
    name: 'Agogó',
    description:
      'Agogó en aluminio cromado de alta calidad. Sonido metálico definido y potente, esencial para marcar el groove y la clave del samba.',
    shortDescription: 'Agogó de aluminio cromado',
    categorySlug: 'agudos',
    productType: 'INSTRUMENT',
    instrumentRegister: 'AGUDO',
    isFeatured: true,
    variants: {
      brands: ['Gope', 'IVSOM', 'Izzo', 'Contemporânea', 'Redenção'],
      models: ['2 bocas', '4 bocas'],
    },
  },
  {
    name: 'Chocalho',
    description:
      'Chocalho de platillos en aluminio pulido. Sonido metálico y cristalino que aporta brillo y textura rítmica al conjunto. Fundamental en el groove del samba.',
    shortDescription: 'Chocalho de platillos en aluminio',
    categorySlug: 'agudos',
    productType: 'INSTRUMENT',
    instrumentRegister: 'AGUDO',
    variants: {
      brands: ['Redenção', 'Izzo', 'IVSOM', 'King', 'Gope', 'Contemporânea'],
    },
  },
  {
    name: 'Frigideira',
    description:
      'Frigideira de metal con sonido agudo y penetrante. Instrumento versátil que marca los acentos rítmicos con precisión quirúrgica.',
    shortDescription: 'Frigideira de metal para percusión',
    categorySlug: 'agudos',
    productType: 'INSTRUMENT',
    instrumentRegister: 'AGUDO',
    variants: {
      brands: ['Redenção', 'IVSOM', 'King', 'Contemporânea'],
      sizes: ['4,5"', '6"'],
    },
  },

  // ═══════════════════════════════════════════════════════
  // INSTRUMENTOS — MEDIOS
  // ═══════════════════════════════════════════════════════
  {
    name: 'Caixa',
    description:
      'Caixa de guerra con casco de aluminio de alta resistencia. Respuesta seca y cortante que define la línea rítmica de la batería. Disponible con caja de resonancia o modelo vazado.',
    shortDescription: 'Caixa de guerra en aluminio',
    categorySlug: 'medios',
    productType: 'INSTRUMENT',
    instrumentRegister: 'MEDIO',
    isFeatured: true,
    variants: {
      brands: ['Gope', 'IVSOM', 'Contemporânea', 'King', 'Redenção', 'Izzo'],
      models: ['Con caja', 'Vazada'],
    },
  },
  {
    name: 'Timbal',
    description:
      'Timbal de percusión brasileña con casco de aluminio. Sonido cálido y envolvente para acompañamientos rítmicos y variaciones. Instrumento versátil para registro medio.',
    shortDescription: 'Timbal de percusión brasileña',
    categorySlug: 'medios',
    productType: 'INSTRUMENT',
    instrumentRegister: 'MEDIO',
    variants: {
      brands: ['Contemporânea', 'Izzo', 'Gope', 'IVSOM'],
    },
  },

  // ═══════════════════════════════════════════════════════
  // INSTRUMENTOS — GRAVES
  // ═══════════════════════════════════════════════════════
  {
    name: 'Surdo',
    description:
      'Surdo con casco de aluminio pulido y afinación precisa. Tono profundo y envolvente que marca el pulso fundamental de la batería. El corazón rítmico de todo ensemble de samba.',
    shortDescription: 'Surdo de aluminio, el corazón de la batería',
    categorySlug: 'graves',
    productType: 'INSTRUMENT',
    instrumentRegister: 'GRAVE',
    isFeatured: true,
    variants: {
      brands: ['Gope', 'IVSOM', 'Contemporânea', 'King', 'Redenção', 'Izzo'],
      sizes: ['18"', '22"', '24"', '26"', '28"'],
    },
  },
  {
    name: 'Cuica',
    description:
      'Cuica tradicional brasileña con cuerpo de aluminio y parche de cuero. Produce el característico sonido vocal y expresivo que distingue al samba. Instrumento melódico-percusivo único.',
    shortDescription: 'Cuica tradicional brasileña',
    categorySlug: 'graves',
    productType: 'INSTRUMENT',
    instrumentRegister: 'GRAVE',
    variants: {
      brands: ['Redenção', 'Izzo', 'IVSOM', 'King', 'Gope', 'Contemporânea'],
      sizes: ['6,5"', '8"', '9"', '9,5"', '10"'],
    },
  },

  // ═══════════════════════════════════════════════════════
  // ACCESORIOS — PARCHES
  // ═══════════════════════════════════════════════════════
  {
    name: 'Parche de Plástico',
    description:
      'Parche de plástico de alta resistencia para instrumentos de percusión. Sonido definido y duradero, ideal para todo tipo de instrumentos. Disponible en todas las medidas estándar.',
    shortDescription: 'Parche plástico resistente, todas las medidas',
    categorySlug: 'parches',
    productType: 'ACCESSORY',
    variants: {
      brands: ['Gope', 'IVSOM', 'Contemporânea', 'King', 'Redenção', 'Izzo'],
      sizes: ['6"', '8"', '10"', '12"', '14"', '16"', '18"', '22"', '24"', '26"', '28"'],
      materials: ['Plástico'],
    },
  },
  {
    name: 'Parche de Cuero',
    description:
      'Parche de cuero natural para surdos y tambores graves. Tono cálido y orgánico que aporta profundidad y cuerpo al sonido del instrumento.',
    shortDescription: 'Parche de cuero natural para graves',
    categorySlug: 'parches',
    productType: 'ACCESSORY',
    variants: {
      brands: ['Gope', 'King', 'Izzo', 'IVSOM', 'Contemporânea'],
      sizes: ['18"', '22"', '24"', '26"', '28"'],
      materials: ['Cuero'],
    },
  },
  {
    name: 'Parche de Cuica',
    description:
      'Parche especial para cuica. Diseñado para producir el sonido vocal característico con máxima respuesta y durabilidad.',
    shortDescription: 'Parche especial para cuica',
    categorySlug: 'parches',
    productType: 'ACCESSORY',
    variants: {
      brands: ['Izzo', 'Gope', 'IVSOM', 'Contemporânea'],
      sizes: ['6"', '8"', '9"', '9,5"', '10"'],
    },
  },
  {
    name: 'Gambito de Bambú',
    description:
      'Gambito de bambú natural para cuica. Varilla interna que produce la fricción necesaria para el sonido característico del instrumento.',
    shortDescription: 'Gambito de bambú para cuica',
    categorySlug: 'parches',
    productType: 'ACCESSORY',
    variants: {
      brands: ['Gope', 'IVSOM'],
    },
  },

  // ═══════════════════════════════════════════════════════
  // ACCESORIOS — BAQUETAS Y PALILLOS
  // ═══════════════════════════════════════════════════════
  {
    name: 'Palillos',
    description:
      'Palillos de nailon profesionales para caixa y repique. Diseñados para máxima durabilidad y respuesta rápida en cada golpe. Esenciales para todo ritmista.',
    shortDescription: 'Palillos de nailon para caixa y repique',
    categorySlug: 'baquetas-y-palillos',
    productType: 'ACCESSORY',
    variants: {
      brands: ['Gope', 'IVSOM', 'King', 'Redenção'],
    },
  },
  {
    name: 'Mazos de Marcación',
    description:
      'Mazos acolchados para marcación de surdo. Cabeza de fieltro que produce un golpe profundo y definido sin dañar el parche. Ideales para primera, segunda y tercera.',
    shortDescription: 'Mazos acolchados para surdo',
    categorySlug: 'baquetas-y-palillos',
    productType: 'ACCESSORY',
    variants: {
      brands: ['Gope', 'IVSOM', 'King', 'Redenção', 'Izzo'],
    },
  },
  {
    name: 'Baquetas',
    description:
      'Baquetas profesionales de nailon multicabeza para tamborim y repique. Disponibles en diferentes configuraciones de gotas y largos para adaptarse a cada estilo de toque.',
    shortDescription: 'Baquetas multicabeza para tamborim y repique',
    categorySlug: 'baquetas-y-palillos',
    productType: 'ACCESSORY',
    variants: {
      brands: ['IVSOM', 'Contemporânea', 'King', 'Redenção', 'Izzo'],
      models: ['1 gota', '2 gotas', '3 gotas', '5 gotas', '7 gotas', 'Corta', '40cm'],
    },
  },
  {
    name: 'Baqueta de Frigideira',
    description:
      'Baqueta metálica diseñada específicamente para frigideira. Punta de metal que produce el sonido agudo y penetrante característico del instrumento.',
    shortDescription: 'Baqueta metálica para frigideira',
    categorySlug: 'baquetas-y-palillos',
    productType: 'ACCESSORY',
    variants: {
      brands: ['Contemporânea', 'King', 'IVSOM'],
    },
  },

  // ═══════════════════════════════════════════════════════
  // ACCESORIOS — CORREAS
  // ═══════════════════════════════════════════════════════
  {
    name: 'Correa',
    description:
      'Correa profesional con enganche seguro y distribución ergonómica del peso. Disponible en modelo simple y acolchonado para máximo confort durante horas de carnaval.',
    shortDescription: 'Correa profesional para instrumentos',
    categorySlug: 'correas',
    productType: 'ACCESSORY',
    variants: {
      brands: ['Redenção', 'Gope', 'IVSOM', 'Contemporânea', 'King'],
      models: ['Simple', 'Acolchonada'],
    },
  },
  {
    name: 'Gorgurão',
    description:
      'Gorgurão de tela resistente para sujeción de instrumentos. Material textil grueso que aporta firmeza y comodidad al sujetar el instrumento durante el desfile.',
    shortDescription: 'Gorgurão de tela para instrumentos',
    categorySlug: 'correas',
    productType: 'ACCESSORY',
    variants: {
      brands: ['Gope', 'IVSOM', 'Redenção'],
    },
  },
  {
    name: 'Bordão',
    description:
      'Bordão (esteirinha) de acero inoxidable para caixa. Produce el característico zumbido de la caixa de guerra al vibrar contra el parche inferior.',
    shortDescription: 'Bordão de acero para caixa',
    categorySlug: 'correas',
    productType: 'ACCESSORY',
    variants: {
      brands: ['Gope', 'IVSOM', 'Contemporânea', 'Redenção', 'Izzo'],
    },
  },

  // ═══════════════════════════════════════════════════════
  // ACCESORIOS — TENSORES Y LLAVES
  // ═══════════════════════════════════════════════════════
  {
    name: 'Tensor Varilla',
    description:
      'Tensor de varilla roscada para afinación de instrumentos. Disponible en diferentes largos para adaptarse a surdos, repiques y caixas de cualquier medida.',
    shortDescription: 'Tensor de varilla para afinación',
    categorySlug: 'tensores-y-llaves',
    productType: 'ACCESSORY',
    variants: {
      brands: ['IVSOM', 'Contemporânea', 'Redenção'],
      sizes: ['13cm', '15cm', '20cm', '25cm', '30cm', '40cm', '50cm', '63,5cm'],
    },
  },
  {
    name: 'Llave de Afinación',
    description:
      'Llave de afinación universal para surdos, repiques y caixas. Herramienta indispensable para mantener la tensión correcta del parche y obtener el tono deseado.',
    shortDescription: 'Llave de afinación universal',
    categorySlug: 'tensores-y-llaves',
    productType: 'ACCESSORY',
    variants: {
      brands: ['Gope', 'IVSOM', 'Contemporânea', 'Redenção', 'Izzo'],
    },
  },
  {
    name: 'Tensor Tamborim',
    description:
      'Tensor específico para tamborim. Diseñado para el sistema de afinación particular de este instrumento, permite ajustar la tensión con precisión.',
    shortDescription: 'Tensor específico para tamborim',
    categorySlug: 'tensores-y-llaves',
    productType: 'ACCESSORY',
    variants: {
      brands: ['IVSOM', 'Contemporânea', 'Redenção'],
    },
  },

  // ═══════════════════════════════════════════════════════
  // ACCESORIOS — FUNDAS
  // ═══════════════════════════════════════════════════════
  {
    name: 'Funda para Tamborim',
    description: 'Funda acolchada para tamborim con cierre y correa de transporte. Protege tu instrumento durante el traslado.',
    shortDescription: 'Funda acolchada para tamborim',
    categorySlug: 'fundas',
    productType: 'ACCESSORY',
    variants: { brands: ['Gope', 'IVSOM', 'Contemporânea'] },
  },
  {
    name: 'Funda para Repique',
    description: 'Funda reforzada para repique con acolchado interno y correa ajustable. Disponible para todas las medidas de repique.',
    shortDescription: 'Funda reforzada para repique',
    categorySlug: 'fundas',
    productType: 'ACCESSORY',
    variants: { brands: ['Gope', 'IVSOM', 'Contemporânea'] },
  },
  {
    name: 'Funda para Repique Mor',
    description: 'Funda especial para repique mor (de mayor tamaño). Acolchado extra y costuras reforzadas para proteger instrumentos grandes.',
    shortDescription: 'Funda para repique mor',
    categorySlug: 'fundas',
    productType: 'ACCESSORY',
    variants: { brands: ['Gope', 'IVSOM'] },
  },
  {
    name: 'Funda para Surdo',
    description: 'Funda de gran capacidad para surdo con acolchado grueso y asas reforzadas. Protección total para el traslado del instrumento más grande de la batería.',
    shortDescription: 'Funda acolchada para surdo',
    categorySlug: 'fundas',
    productType: 'ACCESSORY',
    variants: { brands: ['Gope', 'IVSOM', 'Contemporânea'] },
  },
  {
    name: 'Funda para Pandeiro',
    description: 'Funda compacta para pandeiro con cierre y asa. Protege el instrumento de golpes y polvo.',
    shortDescription: 'Funda compacta para pandeiro',
    categorySlug: 'fundas',
    productType: 'ACCESSORY',
    variants: { brands: ['Gope', 'IVSOM'] },
  },
  {
    name: 'Funda para Chocalho',
    description: 'Funda tubular acolchada para chocalho. Diseño alargado que protege los platillos durante el transporte.',
    shortDescription: 'Funda tubular para chocalho',
    categorySlug: 'fundas',
    productType: 'ACCESSORY',
    variants: { brands: ['Gope', 'IVSOM'] },
  },
  {
    name: 'Funda para Agogó',
    description: 'Funda adaptada para agogó con compartimiento para las campanas. Protección y comodidad en el traslado.',
    shortDescription: 'Funda para agogó',
    categorySlug: 'fundas',
    productType: 'ACCESSORY',
    variants: { brands: ['Gope', 'IVSOM'] },
  },
  {
    name: 'Funda para Timbal',
    description: 'Funda reforzada para timbal con acolchado interno y correa de hombro. Protección ideal para ensayos y desfiles.',
    shortDescription: 'Funda reforzada para timbal',
    categorySlug: 'fundas',
    productType: 'ACCESSORY',
    variants: { brands: ['Gope', 'IVSOM', 'Contemporânea'] },
  },
  {
    name: 'Funda para Cuica',
    description: 'Funda especial para cuica con espacio para el gambito. Diseño que protege tanto el cuerpo como la varilla interna.',
    shortDescription: 'Funda especial para cuica',
    categorySlug: 'fundas',
    productType: 'ACCESSORY',
    variants: { brands: ['Gope', 'IVSOM'] },
  },
  {
    name: 'Porta Palillos',
    description: 'Estuche porta palillos con cierre y compartimientos. Mantiene las baquetas y palillos organizados y protegidos.',
    shortDescription: 'Estuche porta palillos y baquetas',
    categorySlug: 'fundas',
    productType: 'ACCESSORY',
    variants: { brands: ['Gope', 'IVSOM'] },
  },
];

// ─── Seed principal ──────────────────────────────────────

async function main() {
  console.log('🌱 Iniciando seed del catálogo Axé Percussão...\n');

  // 1. Crear marcas
  console.log('📦 Creando marcas...');
  const brandMap = new Map<string, number>();
  for (const b of BRANDS_DATA) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name },
      create: { name: b.name, slug: b.slug, isActive: true },
    });
    brandMap.set(b.name, brand.id);
    console.log(`   ✓ ${brand.name} (id: ${brand.id})`);
  }

  // 2. Crear categorías
  console.log('\n📂 Creando categorías...');
  const categoryMap = new Map<string, number>();
  for (const c of CATEGORIES_DATA) {
    const category = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, sortOrder: c.sortOrder },
      create: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        sortOrder: c.sortOrder,
        isActive: true,
      },
    });
    categoryMap.set(c.slug, category.id);
    console.log(`   ✓ ${category.name} (id: ${category.id})`);
  }

  // 3. Crear productos y variantes
  console.log('\n🎵 Creando productos y variantes...');
  let totalVariants = 0;

  for (const p of PRODUCTS) {
    const productSlug = slug(p.name);
    const categoryId = categoryMap.get(p.categorySlug);

    // Crear o actualizar producto
    const product = await prisma.product.upsert({
      where: { slug: productSlug },
      update: {
        name: p.name,
        description: p.description,
        shortDescription: p.shortDescription,
        productType: p.productType,
        instrumentRegister: p.instrumentRegister ?? null,
        isFeatured: p.isFeatured ?? false,
        categoryId,
      },
      create: {
        name: p.name,
        slug: productSlug,
        sku: productSku(p.name),
        description: p.description,
        shortDescription: p.shortDescription,
        productType: p.productType,
        instrumentRegister: p.instrumentRegister ?? null,
        isFeatured: p.isFeatured ?? false,
        isActive: true,
        categoryId,
        price: 0, // Admin debe configurar precios
      },
    });

    // Generar todas las combinaciones de variantes
    const { brands, sizes, models, materials } = p.variants;
    const sizeList = sizes?.length ? sizes : [null];
    const modelList = models?.length ? models : [null];
    const materialList = materials?.length ? materials : [null];

    let variantCount = 0;

    for (const brandName of brands) {
      const brandId = brandMap.get(brandName);
      if (!brandId) continue;

      for (const size of sizeList) {
        for (const model of modelList) {
          for (const material of materialList) {
            const skuParts = [p.name, brandName];
            if (size) skuParts.push(size.replace(/"/g, ''));
            if (model) skuParts.push(model);
            if (material) skuParts.push(material);
            const vSku = variantSku(...skuParts);

            try {
              await prisma.productVariant.upsert({
                where: { sku: vSku },
                update: {
                  brandId,
                  size,
                  model,
                  material,
                  isActive: true,
                },
                create: {
                  productId: product.id,
                  brandId,
                  sku: vSku,
                  size,
                  model,
                  material,
                  price: 0, // Admin debe configurar precios
                  stockQuantity: 0,
                  isActive: true,
                },
              });
              variantCount++;
            } catch (err: any) {
              // Skip duplicados por constraint unique
              if (!err.message?.includes('Unique constraint')) {
                console.error(`   ⚠ Error en variante ${vSku}:`, err.message);
              }
            }
          }
        }
      }
    }

    totalVariants += variantCount;
    const typeIcon = p.productType === 'INSTRUMENT' ? '🥁' : '🔧';
    console.log(`   ${typeIcon} ${product.name} — ${variantCount} variantes`);
  }

  console.log(`\n✅ Seed completado exitosamente:`);
  console.log(`   ${BRANDS_DATA.length} marcas`);
  console.log(`   ${CATEGORIES_DATA.length} categorías`);
  console.log(`   ${PRODUCTS.length} productos`);
  console.log(`   ${totalVariants} variantes totales`);
  console.log(
    `\n⚠️  IMPORTANTE: Los precios están en $0. Configurá los precios desde el dashboard de administración.`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
