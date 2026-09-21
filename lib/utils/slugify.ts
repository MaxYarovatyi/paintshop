import slug from "limax";

export function slugify(title: string): string {
    const cyrillicPattern = /^[\u0400-\u04FF]+$/;
    title = cyrillicPattern.test(title) ?  slug(title) : title;
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
}