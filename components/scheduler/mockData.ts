import { Cleaning, Cleaner, Property, Reservation } from "@/types/domain";

const COLORS = ["#60a5fa", "#f59e0b", "#34d399", "#f472b6", "#22d3ee", "#a78bfa", "#f87171", "#4ade80"];
const GUESTS = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris"];

export function generateMockData(propertyCount = 50, reservationsPerProperty = 2) {
  const properties: Property[] = [];
  for (let i = 1; i <= propertyCount; i++) {
    const id = `p${i}`;
    properties.push({ id, name: `Property ${i}`, code: `P-${i.toString().padStart(3, "0")}`, color: COLORS[(i - 1) % COLORS.length] });
  }

  const cleaners: Cleaner[] = [
    { id: "c1", name: "Alex", color: "#4f46e5", capacity: 3, status: "active" },
    { id: "c2", name: "Bailey", color: "#16a34a", capacity: 2, status: "holiday" },
    { id: "c3", name: "Casey", color: "#dc2626", capacity: 4, status: "active" },
  ];

  const reservations: Reservation[] = [];
  const cleanings: Cleaning[] = [];

  const base = new Date();
  for (const p of properties) {
    let dayCursor = Math.floor(Math.random() * 4); // random spread in first week
    const localRes: Reservation[] = [];
    for (let j = 0; j < reservationsPerProperty; j++) {
      const stayNights = 2 + Math.floor(Math.random() * 4); // 2-5 nights
      const checkIn = new Date(base);
      checkIn.setDate(base.getDate() + dayCursor);
      checkIn.setHours(16, 0, 0, 0); // 4pm check-in
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkIn.getDate() + stayNights);
      checkOut.setHours(10, 0, 0, 0); // 10am check-out

      const rId = `r_${p.id}_${j + 1}`;
      const reservation: Reservation = {
        id: rId,
        propertyId: p.id,
        guestName: GUESTS[(iHash(p.id) + j) % GUESTS.length],
        start: checkIn.toISOString(),
        end: checkOut.toISOString(),
        status: "confirmed",
      };
      reservations.push(reservation);
      localRes.push(reservation);

      dayCursor += stayNights + (j % 2 === 0 ? 1 : 2); // space out reservations
    }

    // Turnover cleaning: strictly between previous checkout and next check-in
    for (let k = 0; k < localRes.length - 1; k++) {
      const prev = localRes[k];
      const next = localRes[k + 1];
      const start = new Date(prev.end);
      const end = new Date(next.start);
      const cleaner = cleaners[Math.floor(Math.random() * cleaners.length)];
      const cleaning: Cleaning = {
        id: `turn_${prev.id}_${next.id}`,
        propertyId: p.id,
        cleanerId: cleaner.id,
        type: "turnover",
        start: start.toISOString(),
        end: end.toISOString(),
        status: "pending",
        // Link cleaning to the incoming reservation so the table can display alongside it
        reservationId: next.id,
      };
      cleanings.push(cleaning);
    }
  }

  return { properties, reservations, cleanings, cleaners };
}

function iHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
