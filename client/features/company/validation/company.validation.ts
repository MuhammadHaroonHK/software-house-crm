import type { Company } from "../types/company.types";

export type CompanyValidationErrors =
  Record<string, string>;

export function validateCompany(
  company: Company
): CompanyValidationErrors {
  const errors: CompanyValidationErrors = {};

  const companyName =
    company.companyName.trim();

  const companyEmail =
    company.companyEmail.trim();

  if (!companyName) {
    errors.companyName =
      "Company name is required.";
  } else if (companyName.length < 2) {
    errors.companyName =
      "Company name must be at least 2 characters.";
  } else if (companyName.length > 150) {
    errors.companyName =
      "Company name must not exceed 150 characters.";
  }

  if (!companyEmail) {
    errors.companyEmail =
      "Company email is required.";
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      companyEmail
    )
  ) {
    errors.companyEmail =
      "Please enter a valid email address.";
  }

  if (
    company.website &&
    !isValidUrl(company.website)
  ) {
    errors.website =
      "Please enter a valid website URL.";
  }

  if (
    company.logo &&
    !isValidUrl(company.logo)
  ) {
    errors.logo =
      "Please enter a valid logo URL.";
  }

  if (company.currency.trim().length === 0) {
    errors.currency =
      "Currency is required.";
  }

  if (company.timezone.trim().length === 0) {
    errors.timezone =
      "Timezone is required.";
  }

  return errors;
}

function isValidUrl(
  value: string
): boolean {
  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}