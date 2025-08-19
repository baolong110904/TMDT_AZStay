import axios from "axios";

const PAYPAL_API = process.env.PAYPAL_API!;
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

// Lấy access token từ PayPal
export const getAccessToken = async (): Promise<string> => {
  const response = await axios.post(
    `${PAYPAL_API}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      auth: {
        username: CLIENT_ID,
        password: CLIENT_SECRET,
      },
    }
  );
  return response.data.access_token;
};

// Tạo PayPal order (giống như createVnpayPaymentUrl)
export const createPaypalOrder = async (
  bookingId: string,
  amount: number,
  returnUrl: string,
  cancelUrl: string
): Promise<string> => {
  const accessToken = await getAccessToken();

  const response = await axios.post(
    `${PAYPAL_API}/v2/checkout/orders`,
    {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: bookingId,
          amount: {
            currency_code: "USD",
            value: amount.toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  // Lấy link để redirect user sang PayPal
  const approvalUrl = response.data.links.find(
    (link: any) => link.rel === "approve"
  )?.href;

  return approvalUrl;
};

// Capture order (verify thanh toán thành công)
export const capturePaypalOrder = async (orderId: string) => {
  const accessToken = await getAccessToken();

  const response = await axios.post(
    `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};
