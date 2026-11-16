/**
 * The vocabulary that lets two strangers' words meet in the middle.
 * Keys are lower-case and already singular (normalize() stems plurals first).
 */

/** Different words for the same kind of thing -> one shared concept token. */
export const CONCEPTS: Record<string, string> = {
  // audio
  airpod: "audio",
  earpod: "audio",
  earbud: "audio",
  earphone: "audio",
  headphone: "audio",
  headset: "audio",
  bud: "audio",
  // bags
  backpack: "bag",
  bag: "bag",
  rucksack: "bag",
  satchel: "bag",
  knapsack: "bag",
  tote: "bag",
  handbag: "bag",
  daypack: "bag",
  // computers
  laptop: "laptop",
  macbook: "laptop",
  chromebook: "laptop",
  thinkpad: "laptop",
  notebookpc: "laptop",
  ipad: "tablet",
  tablet: "tablet",
  // phones
  phone: "phone",
  iphone: "phone",
  samsung: "phone",
  mobile: "phone",
  smartphone: "phone",
  cellphone: "phone",
  android: "phone",
  // charging
  charger: "charger",
  cable: "charger",
  adapter: "charger",
  adaptor: "charger",
  cord: "charger",
  usb: "charger",
  powerbank: "charger",
  // documents
  id: "idcard",
  passport: "idcard",
  // wallets
  wallet: "wallet",
  purse: "wallet",
  cardholder: "wallet",
  billfold: "wallet",
  // bottles
  flask: "bottle",
  bottle: "bottle",
  tumbler: "bottle",
  thermos: "bottle",
  hydroflask: "bottle",
  // clothing
  jacket: "jacket",
  hoodie: "jacket",
  sweater: "jacket",
  coat: "jacket",
  jumper: "jacket",
  sweatshirt: "jacket",
  cardigan: "jacket",
  fleece: "jacket",
  hat: "hat",
  cap: "hat",
  beanie: "hat",
  // keys
  key: "keys",
  keychain: "keys",
  keyring: "keys",
  fob: "keys",
  lanyard: "lanyard",
  // charms and keyrings people describe differently
  sneaker: "shoe",
  shoe: "shoe",
  trainer: "shoe",
  // books
  book: "book",
  textbook: "book",
  notebook: "book",
  // glasses
  glass: "glasses",
  spectacle: "glasses",
  sunglass: "glasses",
  // cases & covers
  case: "case",
  cover: "case",
  pouch: "case",
  sleeve: "case",
  // marks people use to recognise things
  sticker: "sticker",
  decal: "sticker",
  engraved: "engraving",
  engraving: "engraving",
  initial: "engraving",
  scratch: "scratch",
  scratched: "scratch",
  cracked: "crack",
  crack: "crack",
  broken: "crack",
};

/** Two- and three-word phrases checked before single words ("student id" must not become "student" + "id"). */
export const PHRASES: Record<string, string> = {
  "student id card": "idcard",
  "national id card": "idcard",
  "campus id card": "idcard",
  "air pod": "audio",
  "ear bud": "audio",
  "head phone": "audio",
  "id card": "idcard",
  "student id": "idcard",
  "student card": "idcard",
  "campus card": "idcard",
  "identity card": "idcard",
  "national id": "idcard",
  "power bank": "charger",
  "card holder": "wallet",
  "key chain": "keys",
  "key ring": "keys",
  "water bottle": "bottle",
  "hydro flask": "bottle",
  "laptop bag": "bag",
  "laptop sleeve": "case",
  "phone case": "case",
  "lock screen": "wallpaper",
  "north face": "northface",
};

/** Concepts that only say *what kind of item* it is (used by the clarity check). */
export const ITEM_CONCEPTS = new Set([
  "audio",
  "bag",
  "laptop",
  "tablet",
  "phone",
  "charger",
  "idcard",
  "wallet",
  "bottle",
  "jacket",
  "hat",
  "keys",
  "book",
  "glasses",
]);

/** Words carrying no matching signal, plus words other components already score (place, time, colour). */
export const STOP_WORDS = new Set(
  `
  a an the and or but of to in on at by for from with without into onto over under up down off out
  is are was were be been being am it its it's this that these those there here
  i me my mine we our you your he she his her they them their someone somebody anyone
  have has had do does did will would could should can may might must
  not no yes very really quite just some any all one two three few lot lots
  lost lose losing found find finding left leave leaving forgot forget dropped drop picked pick handed hand
  somewhere anywhere everywhere near nearby beside next around inside outside behind between close
  contain containing contained also maybe probably possibly think thought guess sure
  item thing stuff something please help
  color colour colored coloured light pale bright shade
  today yesterday tonight morning afternoon evening night noon midnight day week month ago later earlier
  hour minute time when while after before during
  monday tuesday wednesday thursday friday saturday sunday weekend
  library entrance cafeteria canteen coffee shop football field pitch gym lecture hall room classroom
  dorm dormitory block gate parking lot student center centre campus building floor table desk bench
  `
    .split(/\s+/)
    .filter(Boolean),
);

/** Brand names we can recognise in free text (canonical spelling on the right). */
export const BRANDS: Record<string, string> = {
  apple: "Apple",
  airpod: "Apple",
  iphone: "Apple",
  macbook: "Apple",
  ipad: "Apple",
  samsung: "Samsung",
  galaxy: "Samsung",
  sony: "Sony",
  bose: "Bose",
  jbl: "JBL",
  beats: "Beats",
  dell: "Dell",
  hp: "HP",
  lenovo: "Lenovo",
  thinkpad: "Lenovo",
  asus: "Asus",
  acer: "Acer",
  xiaomi: "Xiaomi",
  tecno: "Tecno",
  infinix: "Infinix",
  huawei: "Huawei",
  oppo: "Oppo",
  anker: "Anker",
  nike: "Nike",
  adidas: "Adidas",
  puma: "Puma",
  jansport: "JanSport",
  herschel: "Herschel",
  northface: "The North Face",
  hydroflask: "Hydro Flask",
  stanley: "Stanley",
  casio: "Casio",
};
