export const CATEGORIES = [
  { id: 'owoce-warzywa', name: 'Owoce i warzywa', icon: '🥦', color: '#22c55e' },
  { id: 'nabial', name: 'Nabiał', icon: '🧀', color: '#f59e0b' },
  { id: 'mieso', name: 'Mięso i ryby', icon: '🥩', color: '#ef4444' },
  { id: 'pieczywo', name: 'Pieczywo', icon: '🍞', color: '#d97706' },
  { id: 'napoje', name: 'Napoje', icon: '🥤', color: '#06b6d4' },
  { id: 'mrozonki', name: 'Mrożonki', icon: '🧊', color: '#3b82f6' },
  { id: 'przekaski', name: 'Przekąski', icon: '🍪', color: '#8b5cf6' },
  { id: 'przyprawy', name: 'Przyprawy i sosy', icon: '🧂', color: '#f97316' },
  { id: 'konserwy', name: 'Konserwy', icon: '🥫', color: '#dc2626' },
  { id: 'chemia', name: 'Chemia i higiena', icon: '🧴', color: '#14b8a6' },
  { id: 'inne', name: 'Inne', icon: '📦', color: '#64748b' },
] as const;

const KEYWORD_MAP: Record<string, string> = {
  jabłk: 'owoce-warzywa', gruszk: 'owoce-warzywa', banan: 'owoce-warzywa',
  pomidor: 'owoce-warzywa', ogórek: 'owoce-warzywa', sałat: 'owoce-warzywa',
  marchew: 'owoce-warzywa', cebul: 'owoce-warzywa', ziemniak: 'owoce-warzywa',
  kartof: 'owoce-warzywa', pietruszk: 'owoce-warzywa', papryk: 'owoce-warzywa',
  czosn: 'owoce-warzywa', kapust: 'owoce-warzywa', brokuł: 'owoce-warzywa',
  szpinak: 'owoce-warzywa', cytryn: 'owoce-warzywa', pomarańcz: 'owoce-warzywa',
  truskawk: 'owoce-warzywa', malin: 'owoce-warzywa', winogrodn: 'owoce-warzywa',
  awokado: 'owoce-warzywa', mango: 'owoce-warzywa', ananas: 'owoce-warzywa',
  arbuz: 'owoce-warzywa', grzyb: 'owoce-warzywa', pieczark: 'owoce-warzywa',

  mleko: 'nabial', ser: 'nabial', jogurt: 'nabial', śmietan: 'nabial',
  masło: 'nabial', twaróg: 'nabial', kefir: 'nabial', mozzarell: 'nabial',
  jajk: 'nabial', jaja: 'nabial',

  kurczak: 'mieso', pierś: 'mieso', mięso: 'mieso', kiełbas: 'mieso',
  szynk: 'mieso', boczek: 'mieso', wołowin: 'mieso', wieprzow: 'mieso',
  indyk: 'mieso', ryb: 'mieso', łosoś: 'mieso', tuńczyk: 'mieso',
  parówk: 'mieso', salami: 'mieso', kabanos: 'mieso',

  chleb: 'pieczywo', bułk: 'pieczywo', bagietk: 'pieczywo', mąk: 'pieczywo',
  tortill: 'pieczywo', makaron: 'pieczywo', ryż: 'pieczywo', kaszy: 'pieczywo',
  płatk: 'pieczywo', musli: 'pieczywo', owsian: 'pieczywo',

  wod: 'napoje', sok: 'napoje', kaw: 'napoje', herbat: 'napoje',
  piw: 'napoje', win: 'napoje', cola: 'napoje', pepsi: 'napoje',
  sprite: 'napoje', fant: 'napoje',

  mrożon: 'mrozonki', lod: 'mrozonki', pizza: 'mrozonki',
  frytk: 'mrozonki',

  czekola: 'przekaski', cukier: 'przekaski', ciastk: 'przekaski',
  chips: 'przekaski', orzech: 'przekaski', baton: 'przekaski',
  żelk: 'przekaski', wafel: 'przekaski', krakier: 'przekaski',

  sól: 'przyprawy', pieprz: 'przyprawy', ketchup: 'przyprawy',
  musztard: 'przyprawy', majonez: 'przyprawy', ocet: 'przyprawy',
  olej: 'przyprawy', oliw: 'przyprawy', sos: 'przyprawy',

  konserwi: 'konserwy', puszka: 'konserwy', fasol: 'konserwy',
  kukurydz: 'konserwy', groszek: 'konserwy',

  szampon: 'chemia', mydło: 'chemia', pasta: 'chemia', papier: 'chemia',
  proszek: 'chemia', płyn: 'chemia', szmata: 'chemia', gąbk: 'chemia',
  worek: 'chemia', foli: 'chemia', ręcznik: 'chemia', chustek: 'chemia',
};

export function guessCategory(productName: string): string {
  const lower = productName.toLowerCase();
  for (const [keyword, categoryId] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) return categoryId;
  }
  return 'inne';
}

export function getCategoryById(id: string) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}
