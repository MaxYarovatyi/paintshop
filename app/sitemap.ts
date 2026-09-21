import type { MetadataRoute } from "next";
import { getPaintings } from "@/lib/supabase/queries";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = SITE_URL;
    const paintings = await getPaintings();

    const staticPages = ["", "/gallery", "/about", "/contact"].map((path)=> ({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
    }));

    const paintingPages = paintings.map((p)=> ({
        url: `${baseUrl}/paintings/${p.slug}`,
        lastModified: p.updatedAt
    }))

    return [...staticPages, ...paintingPages];
}