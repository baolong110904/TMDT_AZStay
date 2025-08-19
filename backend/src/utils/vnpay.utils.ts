import crypto from "crypto";
import qs from "qs";
import querystring from 'qs'

// Hàm sort object theo key (giống demo VNPay)
function sortObject(obj: Record<string, any>): Record<string, any> {
  const sorted: Record<string, any> = {};
  const keys = Object.keys(obj).sort();
  keys.forEach(key => {
    sorted[key] = obj[key];
  });
  return sorted;
}

function formatDateVN(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

export const createVnpayPaymentUrl = (
  bookingId: string,
  amount: number,
  returnUrl: string,
  ipAddr: string = "127.0.0.1"
) => {
  const tmnCode = process.env.VNP_TMN_CODE!;
  const secretKey = process.env.VNP_HASH_SECRET!.trim();
  const vnpUrl = process.env.VNP_URL!;
  
  const date = new Date();
  const createDate = formatDateVN(date);
  
  let vnp_Params: Record<string, any> = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = 'vn';
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = bookingId;
  vnp_Params['vnp_OrderInfo'] = bookingId;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = amount * 100;
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = '127.0.0.1';
  vnp_Params['vnp_CreateDate'] = createDate;

  vnp_Params = sortObject(vnp_Params);

  var signData = querystring.stringify(vnp_Params, { encode: true });

  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

  vnp_Params['vnp_SecureHash'] = signed;

  const finalUrl = vnpUrl + '?' + qs.stringify(vnp_Params, { encode: true });

  return finalUrl;
};