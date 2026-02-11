/**
 * URL base de la API. Debe setearse en BUILD TIME (no en runtime).
 * En Docker: pasar como Build Arg: NEXT_PUBLIC_API_URL=https://back.tudominio.com
 * Si falta, las peticiones irán al mismo origen (front) y darán 404.
 */
function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
  if (typeof window !== "undefined" && !url) {
    console.error(
      "[Axé] NEXT_PUBLIC_API_URL no está definida. Reconstruí la imagen Docker del Front con Build Arg: NEXT_PUBLIC_API_URL=https://back.tudominio.com"
    );
  }
  return url || "";
}

export const API_URL = getApiUrl();
