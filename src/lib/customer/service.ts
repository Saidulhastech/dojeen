// ============================================================
//  Customer Account API — typed service wrappers (PDP/account use).
// ============================================================
import type { AstroCookies } from 'astro';
import { customerFetch } from './client';
import { CUSTOMER_DASHBOARD_QUERY } from './queries';

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface CustomerOrderLine {
  title: string;
  quantity: number;
  image?: { url: string; altText?: string | null } | null;
  price?: Money | null;
}

export interface CustomerOrder {
  id: string;
  name: string;
  number: number;
  processedAt: string;
  financialStatus?: string | null;
  fulfillmentStatus?: string | null;
  totalPrice: Money;
  lineItems: { nodes: CustomerOrderLine[] };
}

export interface CustomerAddress {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  zip?: string | null;
  zoneCode?: string | null;
  territoryCode?: string | null;
  phoneNumber?: string | null;
  formatted: string[];
}

export interface CustomerProfile {
  firstName?: string | null;
  lastName?: string | null;
  emailAddress?: { emailAddress?: string | null } | null;
  phoneNumber?: { phoneNumber?: string | null } | null;
  defaultAddress?: { id: string } | null;
  addresses: { nodes: CustomerAddress[] };
  orders: { nodes: CustomerOrder[] };
}

/** Profile + recent orders + addresses, or null if not authenticated. */
export async function getCustomerDashboard(
  cookies: AstroCookies,
  origin: string,
): Promise<CustomerProfile | null> {
  const data = await customerFetch<{ customer: CustomerProfile | null }>(
    cookies,
    origin,
    CUSTOMER_DASHBOARD_QUERY,
    { ordersFirst: 10, addressesFirst: 10 },
  );
  return data?.customer ?? null;
}
