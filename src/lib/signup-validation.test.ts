import { describe, expect, it } from "vitest";
import { checkSignup } from "./signup-validation";

const valid = { companyName: "Kafue Fibre", firstName: "Natasha", lastName: "Banda", email: "n@kafue.zm", password: "a long sturdy password" };

describe("checkSignup", () => {
  it("accepts a complete form", () => {
    expect(checkSignup(valid)).toEqual({});
  });

  it("requires the confirmation to match", () => {
    expect(checkSignup({ ...valid, confirmPassword: "a long sturdy password" })).toEqual({});
    expect(checkSignup({ ...valid, confirmPassword: "something else" })).toEqual({ confirmPassword: "The passwords do not match" });
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
