/**
 * GET /api/contacts/search
 *
 * Search and filter contacts. Designed for both browser use and AI agent consumption.
 *
 * Query parameters:
 *   q                — free-text search across name, title, company, email, department, location
 *   managementLevel  — filter by level (repeatable): C-Suite | SVP | VP | Director | Manager | Senior IC | IC
 *   department       — filter by department (repeatable): Executive | Sales | Finance | Operations | Engineering | Marketing
 *   industry         — filter by industry (repeatable): e.g. "Real Estate"
 *   companySize      — filter by headcount band (repeatable): "1–50" | "51–200" | "201–500" | "501–1,000+" etc.
 *   location         — filter by location string (repeatable): e.g. "San Antonio, TX"
 *   limit            — max results to return (default: 50, max: 200)
 *   offset           — pagination offset (default: 0)
 *
 * Response: { contacts, total, limit, offset, query, filters }
 */

import { MOCK_CONTACTS, type Contact } from "@/lib/mockData";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sp = url.searchParams;

  const q = sp.get("q")?.trim() ?? "";
  const managementLevel = sp.getAll("managementLevel");
  const department = sp.getAll("department");
  const industry = sp.getAll("industry");
  const companySize = sp.getAll("companySize");
  const location = sp.getAll("location");

  const rawLimit = parseInt(sp.get("limit") ?? "50", 10);
  const limit = Math.min(isNaN(rawLimit) ? 50 : Math.max(1, rawLimit), 200);
  const rawOffset = parseInt(sp.get("offset") ?? "0", 10);
  const offset = isNaN(rawOffset) ? 0 : Math.max(0, rawOffset);

  const filtered: Contact[] = MOCK_CONTACTS.filter((c) => {
    // Free-text match
    if (q) {
      const needle = q.toLowerCase();
      const haystack = [
        c.firstName,
        c.lastName,
        c.title,
        c.company,
        c.email,
        c.department,
        c.location,
        c.primaryIndustry,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }

    if (managementLevel.length && !managementLevel.includes(c.managementLevel))
      return false;
    if (department.length && !department.includes(c.department)) return false;
    if (industry.length && !industry.includes(c.industry)) return false;
    if (companySize.length && !companySize.includes(c.companySize)) return false;
    if (location.length && !location.includes(c.location)) return false;

    return true;
  });

  const total = filtered.length;
  const page = filtered.slice(offset, offset + limit);

  return Response.json(
    {
      contacts: page,
      total,
      limit,
      offset,
      query: q || null,
      filters: {
        managementLevel: managementLevel.length ? managementLevel : null,
        department: department.length ? department : null,
        industry: industry.length ? industry : null,
        companySize: companySize.length ? companySize : null,
        location: location.length ? location : null,
      },
    },
    { headers: CORS_HEADERS }
  );
}
