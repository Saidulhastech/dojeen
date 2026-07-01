// ============================================================
//  Customer Account API — GraphQL operations.
//  Validated against the 2026-04 schema via the shopify-customer skill.
// ============================================================

/** Profile + recent orders + saved addresses for the account dashboard. */
export const CUSTOMER_DASHBOARD_QUERY = /* GraphQL */ `
  query CustomerDashboard($ordersFirst: Int = 10, $addressesFirst: Int = 10) {
    customer {
      firstName
      lastName
      emailAddress { emailAddress }
      phoneNumber { phoneNumber }
      defaultAddress { id }
      addresses(first: $addressesFirst) {
        nodes {
          id
          firstName
          lastName
          company
          address1
          address2
          city
          zip
          zoneCode
          territoryCode
          phoneNumber
          formatted
        }
      }
      orders(first: $ordersFirst, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          number
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice { amount currencyCode }
          lineItems(first: 5) {
            nodes {
              title
              quantity
              image { url altText }
              price { amount currencyCode }
            }
          }
        }
      }
    }
  }
`;
