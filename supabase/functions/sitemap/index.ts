
/**
 * Edge Function: sitemap
 * Generates a dynamic sitemap.xml based on published blog_posts.
 * Usage:
 *  GET /functions/v1/sitemap?siteUrl=https://your-site-domain
 * The siteUrl query param is required so links are absolute to your domain.
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const url = new URL(req.url);
  const siteUrl = url.searchParams.get("siteUrl");

  if (!siteUrl) {
    return new Response(
      "Missing required query param: siteUrl (e.g. https://your-domain)",
      { status: 400 },
    );
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, language, updated_at, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("sitemap query error:", error);
    return new Response("Internal error", { status: 500 });
  }

  // Build absolute URLs. Assuming route pattern: /blog/:slug
  // If you later localize routes, adjust here.
  const urls = (data ?? []).map((row) => {
    const loc = `${siteUrl.replace(/\/$/, "")}/blog/${row.slug}`;
    const lastmod = new Date(row.updated_at ?? row.published_at ?? new Date()).toISOString();
    return { loc, lastmod };
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "max-age=300, s-maxage=300, stale-while-revalidate=600",
    },
  });
});
