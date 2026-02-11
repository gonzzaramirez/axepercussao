import 'dotenv/config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PrismaClient, ProductType, InstrumentRegister } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as crypto from 'node:crypto';

// ─── CONFIGURACIÓN DB ───
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL no definida.');
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ─── CONFIGURACIÓN DE ARCHIVOS ───
interface FileContext {
  categorySlug: string;
  isDynamic?: boolean;
}

const FILES_CONFIG: Record<string, FileContext> = {
  'Hoja de cálculo sin título - PRECIOS.csv': {
    categorySlug: 'dynamic',
    isDynamic: true,
  },
  'precios - PRECIOS.csv': {
    categorySlug: 'dynamic',
    isDynamic: true,
  },
};

// ─── TIPOS INTERNOS ───

interface MasterInfo {
  name: string;
  slug: string;
  categorySlug: string;
  productType: ProductType;
  instrumentRegister: InstrumentRegister | null;
  matchedTerm: string;
}

interface AccessoryPrefixEntry {
  prefix: string;
  masterName: string;
  category: string;
}

interface InstrumentKeywordEntry {
  keyword: string;
  masterName: string;
  category: string;
  register: InstrumentRegister;
}

// ══════════════════════════════════════════════════════════════
// MAPA DE AGRUPACIÓN EN DOS FASES (LA CLAVE DEL ÉXITO)
// ══════════════════════════════════════════════════════════════
//
// FASE 1 — Prefijos de accesorios (evaluados con "startsWith")
//   Resuelve: "Funda para surdo" → Funda (no Surdo)
//             "Baqueta tamborim" → Baquetas (no Tamborim)
//             "Parche Cuica"     → Parche (no Cuica)
//             "Mazo para surdo"  → Mazos (no Surdo)
//
// FASE 2 — Keywords de instrumentos (evaluados con "includes")
//   Solo se alcanza si el nombre NO empieza con un prefijo de accesorio.
//
// Regla de oro: prefijos LARGOS van primero para evitar que uno corto
// matchee antes (ej: "par baqueta" antes de "baqueta").
// ══════════════════════════════════════════════════════════════

const ACCESSORY_PREFIXES: AccessoryPrefixEntry[] = [
  // ── Fundas ──
  { prefix: 'funda', masterName: 'Funda', category: 'fundas' },
  { prefix: 'capa', masterName: 'Funda', category: 'fundas' },

  // ── Baquetas y Palillos (prefijos más largos primero) ──
  {
    prefix: 'par baqueta',
    masterName: 'Baquetas',
    category: 'baquetas-y-palillos',
  },
  {
    prefix: 'par baquet',
    masterName: 'Baquetas',
    category: 'baquetas-y-palillos',
  }, // typo del CSV
  {
    prefix: 'baqueta',
    masterName: 'Baquetas',
    category: 'baquetas-y-palillos',
  },
  {
    prefix: 'palillo',
    masterName: 'Baquetas',
    category: 'baquetas-y-palillos',
  },
  { prefix: 'paillo', masterName: 'Baquetas', category: 'baquetas-y-palillos' }, // typo del CSV
  { prefix: 'bordao', masterName: 'Bordãos', category: 'baquetas-y-palillos' }, // normaliza "Bordãos"

  // ── Mazos ──
  { prefix: 'mazo', masterName: 'Mazos', category: 'baquetas-y-palillos' },

  // ── Parches y Cueros ──
  { prefix: 'parche', masterName: 'Parche', category: 'parches' },
  { prefix: 'pele', masterName: 'Parche', category: 'parches' },
  { prefix: 'cuero', masterName: 'Cuero', category: 'parches' },

  // ── Correas ──
  { prefix: 'correa', masterName: 'Correa', category: 'correas' },
  { prefix: 'talabarte', masterName: 'Correa', category: 'correas' },

  // ── Tensores, Llaves, Tuercas ──
  {
    prefix: 'tensor',
    masterName: 'Tensores y Repuestos',
    category: 'tensores-y-llaves',
  },
  {
    prefix: 'llave',
    masterName: 'Llaves de Afinación',
    category: 'tensores-y-llaves',
  },
  {
    prefix: 'tuerca',
    masterName: 'Tensores y Repuestos',
    category: 'tensores-y-llaves',
  },

  // ── Otros accesorios ──
  { prefix: 'gambito', masterName: 'Gambito', category: 'baquetas-y-palillos' },
  { prefix: 'gorgurao', masterName: 'Gorgurão', category: 'varios' },
  { prefix: 'hule', masterName: 'Hule', category: 'varios' },
];

// Keywords más específicos DEBEN ir antes de los genéricos:
//   "repicaixa" antes de "repique" y "caixa"
//   "furacaixa" antes de "caixa"
//   "timba" matchea tanto "Timba" como "Timbal"

const INSTRUMENT_KEYWORDS: InstrumentKeywordEntry[] = [
  // ── Graves ──
  {
    keyword: 'surdo',
    masterName: 'Surdo',
    category: 'graves',
    register: 'GRAVE' as InstrumentRegister,
  },
  {
    keyword: 'rebolo',
    masterName: 'Rebolo',
    category: 'graves',
    register: 'GRAVE' as InstrumentRegister,
  },
  {
    keyword: 'tantan',
    masterName: 'Tantan',
    category: 'graves',
    register: 'GRAVE' as InstrumentRegister,
  },
  {
    keyword: 'bumbo',
    masterName: 'Bumbo',
    category: 'graves',
    register: 'GRAVE' as InstrumentRegister,
  },
  {
    keyword: 'cuica',
    masterName: 'Cuica',
    category: 'graves',
    register: 'GRAVE' as InstrumentRegister,
  },

  // ── Medios (específicos antes de genéricos) ──
  {
    keyword: 'timba',
    masterName: 'Timbal',
    category: 'medios',
    register: 'MEDIO' as InstrumentRegister,
  },
  {
    keyword: 'repicaixa',
    masterName: 'Repique',
    category: 'agudos',
    register: 'AGUDO' as InstrumentRegister,
  },
  {
    keyword: 'furacaixa',
    masterName: 'Caixa',
    category: 'medios',
    register: 'MEDIO' as InstrumentRegister,
  },
  {
    keyword: 'caixa',
    masterName: 'Caixa',
    category: 'medios',
    register: 'MEDIO' as InstrumentRegister,
  },
  {
    keyword: 'pandeiro',
    masterName: 'Pandeiro',
    category: 'medios',
    register: 'MEDIO' as InstrumentRegister,
  },

  // ── Agudos ──
  {
    keyword: 'repique',
    masterName: 'Repique',
    category: 'agudos',
    register: 'AGUDO' as InstrumentRegister,
  },
  {
    keyword: 'tamborim',
    masterName: 'Tamborim',
    category: 'agudos',
    register: 'AGUDO' as InstrumentRegister,
  },
  {
    keyword: 'agogo',
    masterName: 'Agogó',
    category: 'agudos',
    register: 'AGUDO' as InstrumentRegister,
  },
  {
    keyword: 'chocalho',
    masterName: 'Chocalho',
    category: 'agudos',
    register: 'AGUDO' as InstrumentRegister,
  },
  {
    keyword: 'rocar',
    masterName: 'Rocar',
    category: 'agudos',
    register: 'AGUDO' as InstrumentRegister,
  },
  {
    keyword: 'ganza',
    masterName: 'Ganza',
    category: 'agudos',
    register: 'AGUDO' as InstrumentRegister,
  },
  {
    keyword: 'reco',
    masterName: 'Reco-Reco',
    category: 'agudos',
    register: 'AGUDO' as InstrumentRegister,
  },
  {
    keyword: 'frigideira',
    masterName: 'Frigideira',
    category: 'agudos',
    register: 'AGUDO' as InstrumentRegister,
  },
];

const BASE_CATEGORIES = [
  { name: 'Agudos', slug: 'agudos', sortOrder: 1 },
  { name: 'Medios', slug: 'medios', sortOrder: 2 },
  { name: 'Graves', slug: 'graves', sortOrder: 3 },
  { name: 'Parches', slug: 'parches', sortOrder: 4 },
  { name: 'Baquetas y Palillos', slug: 'baquetas-y-palillos', sortOrder: 5 },
  { name: 'Correas', slug: 'correas', sortOrder: 6 },
  { name: 'Tensores y Llaves', slug: 'tensores-y-llaves', sortOrder: 7 },
  { name: 'Fundas', slug: 'fundas', sortOrder: 8 },
  { name: 'Varios', slug: 'varios', sortOrder: 9 },
];

const BRAND_ALIASES = [
  { name: 'IVSOM', aliases: ['ivsom'] },
  { name: 'Gope', aliases: ['gope'] },
  {
    name: 'Contemporânea',
    aliases: ['contemporanea', 'contemporâneo', 'contemporaneo'],
  },
  { name: 'Redenção', aliases: ['redencao', 'redençao'] },
  { name: 'King', aliases: ['king'] },
  { name: 'Izzo', aliases: ['izzo'] },
  { name: 'Liverpool', aliases: ['liverpool'] },
  { name: 'Japa', aliases: ['japa'] },
  { name: 'Timbra', aliases: ['timbra'] },
  { name: 'Macapas', aliases: ['macapas'] },
  { name: 'Centent', aliases: ['centent'] },
  { name: 'Combat', aliases: ['combat'] },
  { name: 'Multisom', aliases: ['multisom'] },
];

// ─── UTILIDADES ───

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function slugify(text: string): string {
  return normalizeText(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function shortHash(text: string): string {
  return crypto
    .createHash('md5')
    .update(text)
    .digest('hex')
    .substring(0, 6) // 6 hex chars = 16M posibilidades (vs 4 chars = 65K)
    .toUpperCase();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parsePrice(value: string): number | null {
  if (!value) return null;
  const raw = value.trim();
  if (!raw || raw.includes('#VALUE!') || raw.toLowerCase().includes('desde'))
    return null;
  const clean = raw.replace(/[$,]/g, '');
  const final = parseFloat(clean);
  return Number.isFinite(final) && final > 0 ? Math.round(final) : null;
}

/**
 * Parser CSV correcto que maneja "" como comillas escapadas (estándar RFC 4180).
 *
 * El parser original destruía TODOS los caracteres ", lo que eliminaba
 * las pulgadas de medidas como 12", 14", 22", etc.
 *
 * Este parser:
 * - Campo sin comillas: lee hasta la siguiente coma
 * - Campo con comillas: lee hasta la comilla de cierre, tratando "" como " literal
 */
function parseCsvLine(line: string): string[] {
  const cols: string[] = [];
  let current = '';
  let inQuote = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (inQuote) {
      if (char === '"') {
        // ¿Comilla escapada ("") o cierre del campo?
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'; // Comilla literal → preserva pulgadas (ej: 12")
          i += 2;
          continue;
        } else {
          inQuote = false; // Fin del campo entrecomillado
          i++;
          continue;
        }
      } else {
        current += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuote = true;
        i++;
      } else if (char === ',') {
        cols.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
  }

  cols.push(current.trim());
  return cols;
}

/**
 * Clasificación inteligente en dos fases:
 *
 * FASE 1: Si el nombre EMPIEZA con un prefijo de accesorio → ACCESSORY
 *         (resuelve: "Funda para surdo" → Funda, no Surdo)
 *
 * FASE 2: Si CONTIENE un keyword de instrumento → INSTRUMENT
 *         (keywords específicos antes de genéricos: "repicaixa" antes de "caixa")
 *
 * FASE 3: Fallback → ACCESSORY en categoría "varios"
 */
function getMasterProduct(originalName: string): MasterInfo {
  const norm = normalizeText(originalName);

  // FASE 1: Prefijos de accesorios (prioridad alta)
  for (const acc of ACCESSORY_PREFIXES) {
    if (norm.startsWith(acc.prefix)) {
      return {
        name: acc.masterName,
        slug: slugify(acc.masterName),
        categorySlug: acc.category,
        productType: 'ACCESSORY' as ProductType,
        instrumentRegister: null,
        matchedTerm: acc.prefix,
      };
    }
  }

  // FASE 2: Keywords de instrumentos (por "contiene")
  for (const inst of INSTRUMENT_KEYWORDS) {
    if (norm.includes(inst.keyword)) {
      return {
        name: inst.masterName,
        slug: slugify(inst.masterName),
        categorySlug: inst.category,
        productType: 'INSTRUMENT' as ProductType,
        instrumentRegister: inst.register,
        matchedTerm: inst.keyword,
      };
    }
  }

  // FASE 3: Fallback
  const firstWord = originalName.replace(/\d+/g, '').split(' ')[0];
  return {
    name: firstWord || 'Varios',
    slug: slugify(firstWord || 'varios'),
    categorySlug: 'varios',
    productType: 'ACCESSORY' as ProductType,
    instrumentRegister: null,
    matchedTerm: firstWord?.toLowerCase() || '',
  };
}

function extractAttributes(originalName: string, masterInfo: MasterInfo) {
  const norm = normalizeText(originalName);

  // 1. Detectar marca
  let brandName: string | undefined;
  for (const b of BRAND_ALIASES) {
    if (b.aliases.some((a) => norm.includes(a))) {
      brandName = b.name;
      break;
    }
  }

  // 2. Detectar medida (ahora funciona con " preservado por parseCsvLine)
  //    Grupo 1: N" con extensión opcional xNcm  (ej: 12", 18"x50cm, 9,5")
  //    Grupo 2: NxN con unidad opcional          (ej: 20x12, 20x12", 10x17cm)
  //    Grupo 3: N seguido de cm o mm             (ej: 51cm, 22cm)
  const sizeRegex =
    /\d{1,2}[.,]?\d?\s*"(?:\s*x\s*\d{1,3}\s*(?:cm)?)?|\d{1,2}\s?x\s?\d{1,3}\s*(?:"|cm)?|\d{1,3}\s*(?:cm|mm)/i;
  const sizeMatch = originalName.match(sizeRegex);
  const size = sizeMatch ? sizeMatch[0].trim() : undefined;

  // 3. Detectar material (compuestos primero, específicos antes de genéricos)
  let material: string | undefined;
  if (norm.includes('cuero/nylon')) material = 'Cuero/Nylon';
  else if (norm.includes('cuero/cuero')) material = 'Cuero/Cuero';
  else if (norm.includes('cuero')) material = 'Cuero';
  else if (norm.includes('nylon') || norm.includes('nyon'))
    material = 'Nylon'; // "nyon" = typo CSV
  else if (norm.includes('plastico') || norm.includes('hidraulico'))
    material = 'Plástico';
  else if (norm.includes('madera')) material = 'Madera';
  else if (norm.includes('duraluminio'))
    material = 'Duralumínio'; // antes de "aluminio"
  else if (norm.includes('aluminio')) material = 'Aluminio';
  else if (norm.includes('inox') || norm.includes('acero'))
    material = 'Acero Inox';
  else if (norm.includes('galvaniz')) material = 'Galvanizado';
  else if (norm.includes('transparente')) material = 'Transparente';
  else if (norm.includes('lechoso')) material = 'Lechoso';

  // 4. Calcular modelo (residual descriptivo tras quitar marca, medida, nombre maestro)
  let residual = originalName;

  // Quitar marca
  if (brandName) {
    residual = residual.replace(new RegExp(escapeRegex(brandName), 'gi'), '');
  }

  // Quitar medida
  if (size) {
    residual = residual.replace(size, '');
  }

  // Quitar nombre maestro (con variaciones singular/plural)
  const namesToRemove: string[] = [masterInfo.name];
  if (masterInfo.name.endsWith('s')) {
    namesToRemove.push(masterInfo.name.slice(0, -1)); // "Baquetas" → "Baqueta"
  }
  if (masterInfo.name.endsWith('es')) {
    namesToRemove.push(masterInfo.name.slice(0, -2)); // "Tensores" → "Tensor"
  }
  for (const n of namesToRemove) {
    if (n.length >= 3) {
      try {
        residual = residual.replace(new RegExp(escapeRegex(n), 'gi'), '');
      } catch {
        /* edge case de regex */
      }
    }
  }

  // Limpiar residual
  residual = residual
    .replace(/[""]/g, '') // Comillas sueltas
    .replace(/\(\s*\)/g, '') // Paréntesis vacíos
    .replace(/\s{2,}/g, ' ') // Espacios múltiples
    .replace(/\s*[-–]\s*/g, ' ') // Guiones sueltos
    .replace(/^[\s,.\-/()]+|[\s,.\-/()]+$/g, '') // Puntuación al inicio/final
    .trim();

  // Si el residual es muy corto o igual al material, ignorarlo
  let model: string | undefined = residual.length > 2 ? residual : undefined;
  if (model && material && normalizeText(model) === normalizeText(material))
    model = undefined;

  return { brandName, size, material, model };
}

// ─── MAIN ───

async function main() {
  console.log('🥁 Iniciando Seed Catálogo v2 (agrupación inteligente)...\n');

  // ──────────────────────────────────────────────
  // 1. Crear categorías y marcas
  // ──────────────────────────────────────────────
  console.log('🏗️  Estructurando Base de Datos...');
  const categoryMap = new Map<string, number>();
  for (const cat of BASE_CATEGORIES) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, sortOrder: cat.sortOrder },
    });
    categoryMap.set(cat.slug, c.id);
  }
  console.log(`   ✅ ${categoryMap.size} categorías listas.`);

  const brandMap = new Map<string, number>();
  for (const b of BRAND_ALIASES) {
    const brand = await prisma.brand.upsert({
      where: { slug: slugify(b.name) },
      update: {},
      create: { name: b.name, slug: slugify(b.name) },
    });
    brandMap.set(b.name, brand.id);
  }
  console.log(`   ✅ ${brandMap.size} marcas listas.`);

  // ──────────────────────────────────────────────
  // 2. Procesar archivos CSV
  // ──────────────────────────────────────────────
<<<<<<< HEAD
  const filesDir = __dirname;
=======
 const filesDir = __dirname;
>>>>>>> 021e1c4973f61ad871d5a5ad62400d581d878b36
  const allFiles = fs
    .readdirSync(filesDir)
    .filter((f) => f.toLowerCase().endsWith('.csv'));

  console.log(`\n📂 Archivos CSV encontrados: ${allFiles.length}`);

  // Tracking de precios mínimos por producto padre
  const productMinPrices = new Map<string, number>();

  // Estadísticas
  let totalVariants = 0;
  let instrumentCount = 0;
  let accessoryCount = 0;
  let skippedCount = 0;

  for (const filename of allFiles) {
    const fileConfig = FILES_CONFIG[filename];
    if (!fileConfig) {
      console.log(`   ⚠️  Saltando (no configurado): ${filename}`);
      continue;
    }

    console.log(`\n📄 Procesando: ${filename}`);
    const filePath = path.join(filesDir, filename);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/).slice(1); // Saltar header

    let processedCount = 0;

    for (const line of lines) {
      // Parsear CSV correctamente (preserva " como pulgadas)
      const cols = parseCsvLine(line);

      const rawName = cols[0];
      const rawPrice = cols[2]; // Columna C = "Precio de Venta"

      if (!rawName || !rawPrice) continue;
      const price = parsePrice(rawPrice);
      if (!price) {
        skippedCount++;
        continue;
      }

      // 🧠 CLASIFICACIÓN INTELIGENTE (dos fases)
      const masterInfo = getMasterProduct(rawName);
      const attrs = extractAttributes(rawName, masterInfo);

      // ── Producto padre ──
      const productSlug = masterInfo.slug;
      const categoryId =
        categoryMap.get(masterInfo.categorySlug) || categoryMap.get('varios');

      const desc = `Catálogo completo de ${masterInfo.name}. Seleccione marca y medida en las opciones.`;

      const product = await prisma.product.upsert({
        where: { slug: productSlug },
        update: {
          isActive: true,
          productType: masterInfo.productType,
          instrumentRegister: masterInfo.instrumentRegister,
          categoryId: categoryId,
          // Precio NO se actualiza aquí (se fija al mínimo al final)
        },
        create: {
          name: masterInfo.name,
          slug: productSlug,
          sku: productSlug.toUpperCase(),
          description: desc,
          categoryId: categoryId,
          productType: masterInfo.productType,
          instrumentRegister: masterInfo.instrumentRegister,
          price: price,
          isActive: true,
        },
      });

      // Track precio mínimo
      const currentMin = productMinPrices.get(productSlug);
      if (currentMin === undefined || price < currentMin) {
        productMinPrices.set(productSlug, price);
      }

      // Stats
      if (masterInfo.productType === ('INSTRUMENT' as ProductType))
        instrumentCount++;
      else accessoryCount++;

      // ── Variante específica ──
      const brandId = attrs.brandName
        ? (brandMap.get(attrs.brandName) ?? null)
        : null;

      // Hash único para la variante (6 chars = 16M posibilidades)
      const variantSignature = `${product.id}-${brandId}-${attrs.size}-${attrs.model}-${attrs.material}`;
      const uniqueHash = shortHash(variantSignature);
      const vKey = `${productSlug}-${uniqueHash}`;

      // SKU legible: SURDO-IVS-18-A1B2C3
      const skuParts = [
        productSlug.substring(0, 10).toUpperCase(),
        attrs.brandName ? attrs.brandName.substring(0, 3).toUpperCase() : 'GEN',
        attrs.size ? attrs.size.replace(/[^0-9]/g, '').substring(0, 4) : 'U',
        uniqueHash,
      ];
      const vSku = skuParts.join('-');

      await prisma.productVariant.upsert({
        where: { variantKey: vKey },
        update: { price, isActive: true, sku: vSku },
        create: {
          productId: product.id,
          brandId: brandId,
          size: attrs.size,
          material: attrs.material,
          model: attrs.model,
          sku: vSku,
          variantKey: vKey,
          price: price,
          stockQuantity: 10,
          isActive: true,
        },
      });

      processedCount++;
    }

    totalVariants += processedCount;
    console.log(`   ✅ ${processedCount} variantes importadas.`);
  }

  // ──────────────────────────────────────────────
  // 3. Actualizar precios base al MÍNIMO de sus variantes
  // ──────────────────────────────────────────────
  console.log('\n📊 Fijando precios base (mínimo por producto)...');
  for (const [pSlug, minPrice] of productMinPrices) {
    await prisma.product.update({
      where: { slug: pSlug },
      data: { price: minPrice },
    });
  }
  console.log(
    `   ✅ ${productMinPrices.size} productos actualizados con precio mínimo.`,
  );

  // ──────────────────────────────────────────────
  // 4. Resumen final
  // ──────────────────────────────────────────────
  console.log('\n' + '═'.repeat(50));
  console.log('📊 RESUMEN DEL SEED');
  console.log('═'.repeat(50));
  console.log(`   Productos padre:    ${productMinPrices.size}`);
  console.log(`   Variantes totales:  ${totalVariants}`);
  console.log(`   — Instrumentos:     ${instrumentCount}`);
  console.log(`   — Accesorios:       ${accessoryCount}`);
  console.log(`   Filas saltadas:     ${skippedCount}`);
  console.log('═'.repeat(50));
  console.log('\n✨ Seed Catálogo finalizado correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
