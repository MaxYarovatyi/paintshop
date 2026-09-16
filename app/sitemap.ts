import type { MetadataRoute } from "next";
import { getPaintings } from "@/lib/supabase/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "http://paintshop-seven.vercel.app"; //swap once custom domain is set;
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