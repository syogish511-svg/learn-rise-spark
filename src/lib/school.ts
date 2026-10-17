export const SCHOOL = {
  name: "SRI RAMAKRISHNA SHARADADEVI VIDYAMANDIRA",
  sub: "CLASS 10 | ICSE BOARD",
  tagline: "Learn Every Day. Improve Every Week. Achieve Excellence.",
};

/** Students sign in with a Student ID; auth needs an email, so we derive a private one. */
export function studentEmail(studentCode: string) {
  const clean = studentCode.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  return `${clean}@students.srsv.school`;
}

export const RESOURCE_TYPES = [
  "notes",
  "worksheet",
  "homework",
  "practice paper",
  "previous ICSE paper",
  "specimen paper",
  "answer key",
  "solutions",
  "diagram",
  "video",
  "link",
] as const;
