import { describe, expect, it } from "vitest";
import { companyImageKey, isCompanyImageUrl, publicUrlFor } from "./uploads";

const company = "11111111-1111-4111-8111-111111111111";
const other = "22222222-2222-4222-8222-222222222222";
const id = "33333333-3333-4333-8333-333333333333";

describe("company image keys", () => {
  it("builds keys under the company prefix with an extension from the content type", () => {
    expect(companyImageKey(company, "logo", "image/png", id)).toBe(`companies/${company}/logo/${id}.png`);
    expect(companyImageKey(company, "logo", "image/jpeg", id)).toMatch(/\.jpg$/);
  });

  it("accepts only this company's uploaded images", () => {
    const url = publicUrlFor("bucket", "af-south-1", companyImageKey(company, "logo", "image/webp", id));
    expect(isCompanyImageUrl(url, company, "bucket", "af-south-1", "logo")).toBe(true);
    expect(isCompanyImageUrl(url, other, "bucket", "af-south-1", "logo")).toBe(false);
    expect(isCompanyImageUrl("https://evil.example/x.png", company, "bucket", "af-south-1", "logo")).toBe(false);
    expect(isCompanyImageUrl(`${url}/../../${other}/logo/${id}.png`, company, "bucket", "af-south-1", "logo")).toBe(false);
    expect(isCompanyImageUrl(url.replace(".webp", ".svg"), company, "bucket", "af-south-1", "logo")).toBe(false);
  });
});
