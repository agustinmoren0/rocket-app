/**
 * Image Optimization Utilities
 * Handles PWA icon optimization, compression, and format conversion
 */

/**
 * Get optimized PWA icon paths
 * These icons are already in the public/icons directory
 * Recommended sizes for PWA:
 * - 192x192: Used for most home screen icons
 * - 512x512: Used for splash screens
 * - Maskable variants: Support adaptive icons on Android
 */
export const PWA_ICONS = {
  small: {
    src: '/icons/icon-192.png',
    sizes: '192x192',
    type: 'image/png',
    purpose: 'any',
  },
  large: {
    src: '/icons/icon-512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'any',
  },
  maskable_small: {
    src: '/icons/maskable-192.png',
    sizes: '192x192',
    type: 'image/png',
    purpose: 'maskable',
  },
  maskable_large: {
    src: '/icons/maskable-512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'maskable',
  },
};

/**
 * Optimal image sizes for different devices
 */
export const RESPONSIVE_IMAGE_SIZES = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  large: 1440,
};

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  basePath: string,
  formats: Array<{ width: number; suffix?: string }> = [
    { width: 320, suffix: 'sm' },
    { width: 640, suffix: 'md' },
    { width: 1024, suffix: 'lg' },
  ]
): string {
  return formats
    .map(({ width, suffix }) => {
      const path = basePath.replace(/\.[^/.]+$/, (match) => `-${suffix || width}w${match}`);
      return `${path} ${width}w`;
    })
    .join(', ');
}

/**
 * Image optimization recommendations
 */
export interface ImageOptimizationTips {
  checkCompression: string;
  formatConversion: string;
  responsiveImages: string;
  lazyLoading: string;
  nextImage: string;
}

export const OPTIMIZATION_TIPS: ImageOptimizationTips = {
  checkCompression: `
    For best results, ensure PWA icons are:
    - 192x192: ~8-15 KB (currently 8.6 KB ✓)
    - 512x512: ~8-15 KB (currently 8.6 KB ✓)
    - PNG format with OptiPNG or similar tool
  `,
  formatConversion: `
    Consider converting to modern formats:
    - WebP: 25-35% smaller than PNG
    - AVIF: 40-50% smaller than PNG
    - Keep PNG as fallback for older browsers
  `,
  responsiveImages: `
    Use Next.js Image component for optimization:
    <Image
      src="/icons/icon-512.png"
      alt="App Icon"
      width={512}
      height={512}
      priority
    />
  `,
  lazyLoading: `
    Use loading="lazy" for below-fold images:
    <img src="..." loading="lazy" />
  `,
  nextImage: `
    Configure next.config.js for image optimization:
    images: {
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    }
  `,
};

/**
 * Calculate image file size reduction potential
 */
export function estimateCompressionSavings(
  originalSize: number,
  fromFormat: 'png' | 'jpg' = 'png',
  toFormat: 'webp' | 'avif' = 'webp'
): {
  original: number;
  estimated: number;
  savings: number;
  percentage: string;
} {
  let reduction = 0;

  // WebP compression ratios
  if (toFormat === 'webp') {
    reduction = fromFormat === 'png' ? 0.25 : 0.2; // 25-30% reduction
  }
  // AVIF compression ratios (better than WebP)
  else if (toFormat === 'avif') {
    reduction = fromFormat === 'png' ? 0.45 : 0.4; // 40-50% reduction
  }

  const estimated = Math.round(originalSize * (1 - reduction));
  const savings = originalSize - estimated;

  return {
    original: originalSize,
    estimated,
    savings,
    percentage: `${(reduction * 100).toFixed(1)}%`,
  };
}

/**
 * PWA icon specifications
 */
export const PWA_ICON_SPECS = {
  requirements: {
    minimum_size: '192x192px',
    recommended_sizes: ['192x192px', '512x512px'],
    format: 'PNG (recommended) or SVG',
    transparent_background: true,
    safe_zone: '40px padding (for maskable icons)',
  },
  best_practices: {
    use_vector_svg: 'For scalable, small file sizes',
    provide_both_variants: 'Regular and maskable versions',
    optimize_png: 'Use OptiPNG, PNGCrush, or similar',
    test_various_backgrounds: 'Ensure visibility on different home screens',
    include_all_sizes: 'For maximum device compatibility',
  },
  current_optimization: {
    icon_192: { size: '8.6 KB', format: 'PNG', status: 'Optimized ✓' },
    icon_512: { size: '8.6 KB', format: 'PNG', status: 'Optimized ✓' },
    maskable_192: { size: '8.6 KB', format: 'PNG', status: 'Optimized ✓' },
    maskable_512: { size: '8.6 KB', format: 'PNG', status: 'Optimized ✓' },
    total: '34.4 KB',
  },
};

/**
 * Cache busting for updated images
 */
export function generateImageUrl(path: string, version?: string): string {
  const url = new URL(path, typeof window !== 'undefined' ? window.location.href : 'http://localhost');

  if (version) {
    url.searchParams.set('v', version);
  } else {
    // Use timestamp as version
    url.searchParams.set('v', Date.now().toString());
  }

  return url.toString();
}

/**
 * Image preloading for critical resources
 */
export function preloadImage(src: string, as: 'image' | 'fetch' = 'image'): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = src;

  if (as === 'image') {
    link.type = 'image/png';
  }

  document.head.appendChild(link);
}

/**
 * Prefetch images for faster loading
 */
export function prefetchImage(src: string): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = src;
  link.as = 'image';

  document.head.appendChild(link);
}

/**
 * Get image dimensions from URL
 */
export async function getImageDimensions(
  src: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };

    img.src = src;
  });
}

/**
 * Manifest with optimized icons
 */
export function generateManifestIcons() {
  return [
    PWA_ICONS.small,
    PWA_ICONS.large,
    PWA_ICONS.maskable_small,
    PWA_ICONS.maskable_large,
  ];
}
