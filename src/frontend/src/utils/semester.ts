export type SemType = "even" | "odd";

export interface SemCalendar {
  year: number;
  semType: SemType;
  classStart: string;
  classEnd: string;
  quiz1Start: string;
  quiz1End: string;
  quiz2Start: string;
  quiz2End: string;
  endSemStart: string;
  endSemEnd: string;
}

export const SLOT_EXAM_DATES: Record<
  string,
  { quiz1: string; quiz2: string; endSem: string }
> = {
  A: { quiz1: "2026-02-16", quiz2: "2026-03-23", endSem: "2026-05-04" },
  B: { quiz1: "2026-02-16", quiz2: "2026-03-23", endSem: "2026-05-05" },
  C: { quiz1: "2026-02-17", quiz2: "2026-03-24", endSem: "2026-05-05" },
  D: { quiz1: "2026-02-17", quiz2: "2026-03-24", endSem: "2026-05-06" },
  E: { quiz1: "2026-02-18", quiz2: "2026-03-25", endSem: "2026-05-06" },
  F: { quiz1: "2026-02-18", quiz2: "2026-03-25", endSem: "2026-05-07" },
  G: { quiz1: "2026-02-19", quiz2: "2026-03-26", endSem: "2026-05-07" },
  H: { quiz1: "2026-02-19", quiz2: "2026-03-26", endSem: "2026-05-08" },
  J: { quiz1: "2026-02-20", quiz2: "2026-03-27", endSem: "2026-05-09" },
  K: { quiz1: "2026-02-20", quiz2: "2026-03-27", endSem: "2026-05-11" },
  L: { quiz1: "2026-02-16", quiz2: "2026-03-23", endSem: "2026-05-12" },
  M: { quiz1: "2026-02-17", quiz2: "2026-03-24", endSem: "2026-05-13" },
  P: { quiz1: "2026-02-18", quiz2: "2026-03-25", endSem: "2026-05-14" },
  Q: { quiz1: "2026-02-19", quiz2: "2026-03-26", endSem: "2026-05-14" },
  R: { quiz1: "2026-02-20", quiz2: "2026-03-27", endSem: "2026-05-15" },
  S: { quiz1: "2026-02-16", quiz2: "2026-03-28", endSem: "2026-05-15" },
  T: { quiz1: "2026-02-17", quiz2: "2026-03-28", endSem: "2026-05-16" },
};

export function autoDetectSem(date: Date = new Date()): SemType {
  const month = date.getMonth() + 1;
  if (month >= 1 && month <= 5) return "even";
  if (month >= 7 && month <= 11) return "odd";
  return "even";
}

export function getSemCalendar(year: number, semType: SemType): SemCalendar {
  if (semType === "even") {
    const y = year;
    return {
      year,
      semType,
      classStart: `${y}-01-06`,
      classEnd: `${y}-04-30`,
      quiz1Start: `${y}-02-16`,
      quiz1End: `${y}-02-20`,
      quiz2Start: `${y}-03-23`,
      quiz2End: `${y}-03-28`,
      endSemStart: `${y}-05-04`,
      endSemEnd: `${y}-05-16`,
    };
  }
  const y = year;
  return {
    year,
    semType,
    classStart: `${y}-07-28`,
    classEnd: `${y}-11-14`,
    quiz1Start: `${y}-09-08`,
    quiz1End: `${y}-09-12`,
    quiz2Start: `${y}-10-13`,
    quiz2End: `${y}-10-17`,
    endSemStart: `${y}-11-17`,
    endSemEnd: `${y}-11-28`,
  };
}

export function isInRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

export function isExamPeriod(
  date: string,
  cal: SemCalendar,
): "quiz1" | "quiz2" | "endSem" | null {
  if (isInRange(date, cal.quiz1Start, cal.quiz1End)) return "quiz1";
  if (isInRange(date, cal.quiz2Start, cal.quiz2End)) return "quiz2";
  if (isInRange(date, cal.endSemStart, cal.endSemEnd)) return "endSem";
  return null;
}
