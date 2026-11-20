import { describe, expect, it } from "vitest";
import { checkSignup } from "./signup-validation";

const valid = { companyName: "Kafue Fibre", firstName: "Natasha", lastName: "Banda", email: "n@kafue.zm", password: "a long sturdy password" };

describe("checkSignup", () => {
  it("accepts a complete form", () => {
    expect(checkSignup(valid)).toEqual({});
  });

  it("flags each missing or malformed field", () => {
    expect(checkSignup({ companyName: " ", firstName: "", lastName: "", email: "nope", password: "short" })).toEqual({
      companyName: "Enter your company name",
      firstName: "Enter your first name",
      lastName: "Enter your last name",
      email: "Enter a valid email address",
      password: "Use at least 10 characters",
    });
  });
});
