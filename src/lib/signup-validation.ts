/** Same rules as the API, so most errors show without a request. The API stays the authority. */
export function checkSignup(body: { companyName: string; firstName: string; lastName: string; email: string; password: string; confirmPassword?: string }) {
  const errors: Record<string, string> = {};
  if (body.companyName.trim().length < 2) errors.companyName = "Enter your company name";
  if (!body.firstName.trim()) errors.firstName = "Enter your first name";
  if (!body.lastName.trim()) errors.lastName = "Enter your last name";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) errors.email = "Enter a valid email address";
  if (body.password.length < 10) errors.password = "Use at least 10 characters";
  if (body.confirmPassword !== undefined && body.confirmPassword !== body.password) errors.confirmPassword = "The passwords do not match";
  return errors;
}
