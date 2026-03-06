interface ProductInfo {
  name: string;
  category: string;
  unit: string;
  image?: string;
  brand?: string;
}

export async function lookupBarcode(barcode: string): Promise<ProductInfo | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name_pl,product_name,brands,categories_tags,image_small_url,quantity`
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const name = p.product_name_pl || p.product_name || '';
    if (!name) return null;

    const category = mapCategory(p.categories_tags || []);
    const unit = guessUnit(p.quantity || '');

    return {
      name,
      category,
      unit,
      image: p.image_small_url || undefined,
      brand: p.brands || undefined,
    };
  } catch {
    return null;
  }
}

const CATEGORY_MAP: Record<string, string> = {
  'en:beverages': 'Napoje',
  'en:dairy': 'Nabiał',
  'en:dairies': 'Nabiał',
  'en:milks': 'Nabiał',
  'en:cheeses': 'Nabiał',
  'en:meats': 'Mięso',
  'en:breads': 'Pieczywo',
  'en:cereals-and-potatoes': 'Pieczywo',
  'en:fruits': 'Owoce i warzywa',
  'en:vegetables-based-foods': 'Owoce i warzywa',
  'en:frozen-foods': 'Mrożonki',
  'en:snacks': 'Przekąski',
  'en:sweets': 'Słodycze',
  'en:chocolates': 'Słodycze',
  'en:condiments': 'Przyprawy',
  'en:sauces': 'Sosy',
  'en:canned-foods': 'Konserwy',
  'en:cleaning-products': 'Chemia',
};

function mapCategory(tags: string[]): string {
  for (const tag of tags) {
    for (const [key, value] of Object.entries(CATEGORY_MAP)) {
      if (tag.includes(key.replace('en:', ''))) return value;
    }
  }
  return 'Inne';
}

function guessUnit(quantity: string): string {
  const lower = quantity.toLowerCase();
  if (lower.includes('ml') || lower.includes('cl') || lower.includes('l')) return 'szt';
  if (lower.includes('kg') || lower.includes('g')) return 'szt';
  return 'szt';
}
