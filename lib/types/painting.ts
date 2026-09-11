export type PaintingStatus = "available" | "reserved" | "sold";

export interface Painting
{
    id:string;
    slug: string;
    title: string;
    description: string;
    priceUsd: number;
    status: PaintingStatus;
    widthCm: number;
    heightCm: number;
    medium: string;
    yearCreated: number | null;
    tags: string[];
    isFeatured: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    images: PaintingImage[];
}

export interface PaintingImage
{
    id: string;
    paintingId: string;
    storagePath: string;
    altText: string;
    sortOrder: number;
    isPrimary: boolean;
}