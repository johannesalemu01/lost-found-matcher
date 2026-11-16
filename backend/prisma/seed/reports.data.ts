/**
 * Demo reports, relative to "now" so the demo always looks fresh.
 * Covers the brief's examples plus the tricky cases the engine must handle.
 *
 * Try "My reports" with: amina@example.edu  (lost backpack + red backpack)
 *                        +251 911 000 111   (lost AirPods case)
 */
import type { Prisma } from "@prisma/client";
import type { Subcategory } from "@lf/shared";

const now = Date.now();
const H = 60 * 60 * 1000;
export const D = 24 * H;
export const ago = (ms: number) => new Date(now - ms);

export type SeedReport = Omit<Prisma.ReportCreateInput, "category" | "subcategory" | "eventEnd" | "createdAt"> & {
  key: string;
  subcategory: Subcategory;
  /** Demo photo in prisma/seed/photos/ (staff-only, verification only). */
  photo?: string;
  eventEnd?: Date;
  createdAt?: Date;
};

export const seedReports: SeedReport[] = [
  // ── Brief example: backpack (STRONG, matching private details) ──
  {
    key: "lostBackpack",
    type: "LOST",
    subcategory: "BACKPACK",
    title: "Black backpack",
    description: "Black backpack containing a laptop charger, lost in the library in the afternoon.",
    colorFamily: "BLACK_DARK",
    locations: ["MAIN_LIBRARY"],
    eventStart: ago(30 * H),
    eventEnd: ago(26 * H),
    privateDetail: "Laptop charger wrapped with blue tape; my calculus notebook is inside.",
    contactName: "Amina Bekele",
    contactEmailOrPhone: "amina@example.edu",
  },
  {
    key: "foundDarkBackpack",
    type: "FOUND",
    subcategory: "BACKPACK",
    title: "Dark-coloured backpack",
    description: "Dark-coloured backpack near the library entrance in the evening.",
    colorFamily: "BLACK_DARK",
    locations: ["LIBRARY_ENTRANCE"],
    photo: "backpack-found.jpg",
    eventStart: ago(24 * H),
    privateDetail: "Inside: a charger with blue tape around the cable and a maths notebook.",
    contactName: "Dawit Haile",
    contactEmailOrPhone: "dawit@example.edu",
  },

  // ── Brief example: AirPods vs "wireless earbud case" (STRONG via synonyms + colour family + neighbour) ──
  {
    key: "lostAirpods",
    type: "LOST",
    subcategory: "EARBUDS_HEADPHONES",
    title: "AirPods case",
    description: "Black AirPods case near the cafeteria, around lunch.",
    colorFamily: "BLACK_DARK",
    brand: "Apple",
    locations: ["CAFETERIA"],
    eventStart: ago(6 * H),
    eventEnd: ago(4 * H),
    privateDetail: "Small cat sticker on the back of the case.",
    photo: "owner-airpods.png",
    contactName: "Liya Mekonnen",
    contactEmailOrPhone: "+251911000111",
  },
  {
    key: "foundEarbudCase",
    type: "FOUND",
    subcategory: "EARBUDS_HEADPHONES",
    title: "Wireless earbud case",
    description: "Dark wireless earbud case beside the coffee shop.",
    colorFamily: "BLACK_DARK",
    locations: ["COFFEE_SHOP"],
    eventStart: ago(3 * H),
    privateDetail: "Cat sticker on the back.",
    photo: "finder-earbud-case.png",
    contactName: "Yonas Girma",
    contactEmailOrPhone: "yonas@example.edu",
  },

  // ── Found two weeks later, far away (WEAK, capped) ──
  {
    key: "lostOldBackpack",
    type: "LOST",
    subcategory: "BACKPACK",
    title: "Black backpack",
    description: "Black Jansport backpack with a laptop charger, left in lecture hall A.",
    colorFamily: "BLACK_DARK",
    locations: ["LECTURE_HALL_A"],
    eventStart: ago(16 * D + 4 * H),
    eventEnd: ago(16 * D),
    createdAt: ago(16 * D - 2 * H),
    contactName: "Hana Tadesse",
    contactEmailOrPhone: "hana@example.edu",
  },
  {
    key: "foundFieldBackpack",
    type: "FOUND",
    subcategory: "BACKPACK",
    title: "Black backpack",
    description: "Black backpack lying at the football field.",
    colorFamily: "BLACK_DARK",
    locations: ["FOOTBALL_FIELD"],
    eventStart: ago(2 * D),
    contactName: "Groundskeeper",
    contactEmailOrPhone: "grounds@example.edu",
  },

  // ── Colour conflict: red vs black backpack (POSSIBLE at most) ──
  {
    key: "lostRedBackpack",
    type: "LOST",
    subcategory: "BACKPACK",
    title: "Red backpack",
    description: "Red backpack with a water bottle in the side pocket.",
    colorFamily: "RED_PINK",
    locations: ["GYM"],
    eventStart: ago(3 * D + 5 * H),
    eventEnd: ago(3 * D + 2 * H),
    contactName: "Amina Bekele",
    contactEmailOrPhone: "amina@example.edu",
  },
  {
    key: "foundGymBackpack",
    type: "FOUND",
    subcategory: "BACKPACK",
    title: "Black backpack with bottle",
    description: "Black backpack with a water bottle in the side pocket, left in the gym changing room.",
    colorFamily: "BLACK_DARK",
    photo: "backpack-gym.jpg",
    locations: ["GYM"],
    eventStart: ago(3 * D),
    contactName: "Gym reception",
    contactEmailOrPhone: "gym@example.edu",
  },

  // ── Vague: "lost my bag somewhere" (clarity questions; only weak/possible matches) ──
  {
    key: "lostVagueBag",
    type: "LOST",
    subcategory: "OTHER_BAG",
    title: "My bag",
    description: "lost my bag somewhere",
    colorFamily: "UNKNOWN",
    locations: ["NOT_SURE"],
    eventStart: ago(3 * D),
    eventEnd: ago(2 * H),
    contactName: "Samuel Kebede",
    contactEmailOrPhone: "samuel@example.edu",
  },

  // ── Black wallet vs black phone case: different categories, must NOT match ──
  {
    key: "lostWallet",
    type: "LOST",
    subcategory: "WALLET_PURSE",
    title: "Black leather wallet",
    description: "Black leather wallet, bifold, at the student center.",
    colorFamily: "BLACK_DARK",
    locations: ["STUDENT_CENTER"],
    eventStart: ago(28 * H),
    eventEnd: ago(25 * H),
    privateDetail: "Contains my bank card and a photo of my grandmother.",
    contactName: "Meron Alemu",
    contactEmailOrPhone: "meron@example.edu",
  },
  {
    key: "foundPhoneCase",
    type: "FOUND",
    subcategory: "OTHER_ELECTRONICS",
    title: "Black phone case",
    description: "Black leather phone case (no phone inside) on a table in the student center.",
    colorFamily: "BLACK_DARK",
    locations: ["STUDENT_CENTER"],
    eventStart: ago(24 * H),
    contactName: "Front desk",
    contactEmailOrPhone: "frontdesk@example.edu",
  },

  // ── Phone vs earbuds: same parent, different item – must NOT match ──
  {
    key: "lostPhone",
    type: "LOST",
    subcategory: "PHONE",
    title: "Black Samsung phone",
    description: "Black Samsung Galaxy phone with a cracked screen protector.",
    colorFamily: "BLACK_DARK",
    brand: "Samsung",
    locations: ["GYM", "FOOTBALL_FIELD"],
    eventStart: ago(2 * D + 4 * H),
    eventEnd: ago(2 * D),
    privateDetail: "Wallpaper is a photo of a brown dog.",
    photo: "phone.jpg",
    contactName: "Kidus Wolde",
    contactEmailOrPhone: "kidus@example.edu",
  },
  {
    key: "foundEarbuds",
    type: "FOUND",
    subcategory: "EARBUDS_HEADPHONES",
    title: "Black earbuds",
    description: "Black Samsung earbuds in a case, found by the football field bench.",
    colorFamily: "BLACK_DARK",
    brand: "Samsung",
    locations: ["FOOTBALL_FIELD"],
    eventStart: ago(2 * D - 1 * H),
    contactName: "Coach Tesfaye",
    contactEmailOrPhone: "coach@example.edu",
  },

  // ── Found 3 weeks BEFORE it was lost: must NOT match ──
  {
    key: "foundOldBottle",
    type: "FOUND",
    subcategory: "BOTTLE_FLASK",
    title: "Blue flask",
    description: "Blue metal flask with a dent near the bottom.",
    colorFamily: "BLUE",
    locations: ["GYM"],
    eventStart: ago(21 * D),
    contactName: "Gym reception",
    contactEmailOrPhone: "gym@example.edu",
  },
  {
    key: "lostBottle",
    type: "LOST",
    subcategory: "BOTTLE_FLASK",
    title: "Navy Hydro Flask",
    description: "Navy Hydro Flask water bottle with a dent at the bottom.",
    colorFamily: "BLUE",
    brand: "Hydro Flask",
    locations: ["GYM"],
    eventStart: ago(30 * H),
    eventEnd: ago(27 * H),
    contactName: "Ruth Assefa",
    contactEmailOrPhone: "ruth@example.edu",
  },

  // ── Expired: open for 40 days ──
  {
    key: "lostOldHoodie",
    type: "LOST",
    subcategory: "JACKET_HOODIE",
    title: "Grey hoodie",
    description: "Grey university hoodie, size M.",
    colorFamily: "GREY_SILVER",
    locations: ["LECTURE_HALL_B"],
    eventStart: ago(41 * D),
    eventEnd: ago(40 * D + 20 * H),
    createdAt: ago(40 * D),
    contactName: "Bethel Girma",
    contactEmailOrPhone: "bethel@example.edu",
  },

  // ── Student ID with a name on it (name only in private detail) ──
  {
    key: "foundStudentId",
    type: "FOUND",
    subcategory: "STUDENT_ID",
    title: "Student ID card",
    description: "Student ID card in a clear plastic holder near the main gate.",
    colorFamily: "WHITE_LIGHT",
    locations: ["MAIN_GATE"],
    eventStart: ago(5 * H),
    privateDetail: "Name on card: Selam T., ID number ends in 4821.",
    contactName: "Security office",
    contactEmailOrPhone: "security@example.edu",
  },
  {
    key: "lostStudentId",
    type: "LOST",
    subcategory: "STUDENT_ID",
    title: "Student ID",
    description: "My student ID card in a clear holder, probably dropped in the parking lot.",
    colorFamily: "WHITE_LIGHT",
    locations: ["PARKING_LOT"],
    eventStart: ago(9 * H),
    eventEnd: ago(6 * H),
    privateDetail: "Selam Tesfaye, ID ...4821",
    contactName: "Selam Tesfaye",
    contactEmailOrPhone: "selam@example.edu",
  },

  // ── Keys: straightforward strong match ──
  {
    key: "lostKeys",
    type: "LOST",
    subcategory: "KEYS",
    title: "Keys on a red keychain",
    description: "Three keys on a red keychain with a small red sneaker charm.",
    colorFamily: "RED_PINK",
    locations: ["DORM_BLOCK_1"],
    eventStart: ago(20 * H),
    eventEnd: ago(14 * H),
    privateDetail: "One key has a green rubber cover.",
    contactName: "Nahom Bekele",
    contactEmailOrPhone: "nahom@example.edu",
  },
  {
    key: "foundKeys",
    type: "FOUND",
    subcategory: "KEYS",
    title: "Bunch of keys",
    description: "Keys on a red keyring with a little shoe charm, on the stairs of dorm block 2.",
    colorFamily: "RED_PINK",
    locations: ["DORM_BLOCK_2"],
    eventStart: ago(12 * H),
    privateDetail: "One key has a green cover.",
    photo: "keys.jpg",
    contactName: "Dorm warden",
    contactEmailOrPhone: "warden@example.edu",
  },

  // ── Already confirmed: waiting for the owner to collect ──
  {
    key: "lostLaptop",
    type: "LOST",
    subcategory: "LAPTOP_TABLET",
    title: "Silver MacBook Air",
    description: "Silver MacBook Air with a university sticker on the lid.",
    colorFamily: "GREY_SILVER",
    brand: "Apple",
    photo: "laptop-owner.jpg",
    locations: ["LECTURE_HALL_B"],
    eventStart: ago(4 * D + 3 * H),
    eventEnd: ago(4 * D),
    privateDetail: "Login screen shows the username 'ftekle'.",
    contactName: "Feven Tekle",
    contactEmailOrPhone: "feven@example.edu",
    status: "MATCH_PENDING",
  },
  {
    key: "foundLaptop",
    type: "FOUND",
    subcategory: "LAPTOP_TABLET",
    title: "Silver laptop",
    description: "Silver Apple laptop with a university sticker, left on a desk in lecture hall B.",
    colorFamily: "GREY_SILVER",
    brand: "Apple",
    photo: "laptop-found.jpg",
    locations: ["LECTURE_HALL_B"],
    eventStart: ago(4 * D - 1 * H),
    privateDetail: "Username on the lock screen starts with 'ft'.",
    contactName: "Lecturer",
    contactEmailOrPhone: "lecturer@example.edu",
    status: "MATCH_PENDING",
  },
];

/** Pairs that are already confirmed and waiting for the owner to collect the item. */
export const seedConfirmedPairs = [
  { lostKey: "lostLaptop", foundKey: "foundLaptop", note: "Strong match – sticker and lock screen username agree.", confirmedAgo: 3 * D },
];
