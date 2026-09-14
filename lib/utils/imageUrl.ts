export function getPaintingImageUrl(storagePath: string):string {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    return `${base}/storage/v1/object/public/paintings/${storagePath}`
}