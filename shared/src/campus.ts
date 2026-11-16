/**
 * Campus locations and which ones are next to each other.
 * Neighbours are symmetric; the helper below builds both directions.
 */

export const NOT_SURE = "NOT_SURE" as const;

export const LOCATIONS = [
  { id: "MAIN_LIBRARY", label: "Main Library" },
  { id: "LIBRARY_ENTRANCE", label: "Library Entrance" },
  { id: "CAFETERIA", label: "Cafeteria" },
  { id: "COFFEE_SHOP", label: "Coffee Shop" },
  { id: "FOOTBALL_FIELD", label: "Football Field" },
  { id: "GYM", label: "Gym" },
  { id: "LECTURE_HALL_A", label: "Lecture Hall A" },
  { id: "LECTURE_HALL_B", label: "Lecture Hall B" },
  { id: "DORM_BLOCK_1", label: "Dormitory Block 1" },
  { id: "DORM_BLOCK_2", label: "Dormitory Block 2" },
  { id: "MAIN_GATE", label: "Main Gate" },
  { id: "PARKING_LOT", label: "Parking Lot" },
  { id: "STUDENT_CENTER", label: "Student Center" },
] as const;

export type CampusLocationId = (typeof LOCATIONS)[number]["id"];
export type LocationId = CampusLocationId | typeof NOT_SURE;

export const LOCATION_IDS: LocationId[] = [...LOCATIONS.map((l) => l.id), NOT_SURE];

const NEIGHBOUR_PAIRS: [CampusLocationId, CampusLocationId][] = [
  ["MAIN_LIBRARY", "LIBRARY_ENTRANCE"],
  ["CAFETERIA", "COFFEE_SHOP"],
  ["FOOTBALL_FIELD", "GYM"],
  ["LECTURE_HALL_A", "LECTURE_HALL_B"],
  ["DORM_BLOCK_1", "DORM_BLOCK_2"],
  ["MAIN_GATE", "PARKING_LOT"],
  ["LIBRARY_ENTRANCE", "COFFEE_SHOP"],
];

const NEIGHBOURS = new Map<string, Set<string>>();
for (const [a, b] of NEIGHBOUR_PAIRS) {
  if (!NEIGHBOURS.has(a)) NEIGHBOURS.set(a, new Set());
  if (!NEIGHBOURS.has(b)) NEIGHBOURS.set(b, new Set());
  NEIGHBOURS.get(a)!.add(b);
  NEIGHBOURS.get(b)!.add(a);
}

export function areNeighbours(a: string, b: string): boolean {
  return NEIGHBOURS.get(a)?.has(b) ?? false;
}

export function locationLabel(id: string): string {
  if (id === NOT_SURE) return "Not sure";
  return LOCATIONS.find((l) => l.id === id)?.label ?? id;
}

export function isLocationId(id: string): id is LocationId {
  return (LOCATION_IDS as string[]).includes(id);
}
