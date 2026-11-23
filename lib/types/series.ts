export type SeriesStatus = "coming" | "live" | "archive";

export interface Series {
  id: string;
  slug: string;
  title: string;
  intro: string;
  releaseDate: string | null;
  status: SeriesStatus;
  coverImagePath: string | null;
  coverImageAlt: string;
  createdAt: string;
  updatedAt: string;
}