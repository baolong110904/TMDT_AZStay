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

  // Debug environment variables
  console.log('=== DEBUG INFO ===');
  console.log('TMN Code:', tmnCode);
  console.log('Secret Key length:', secretKey?.length);
  console.log('VNP URL:', vnpUrl);
  
  const date = new Date();
  const createDate = formatDateVN(date);
  
  // Tạo vnp_Params theo đúng cách VNPay demo
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

  console.log('Before sort:', vnp_Params);

  // Sort object theo key (quan trọng!)
  vnp_Params = sortObject(vnp_Params);
  
  console.log('After sort:', vnp_Params);

  // Tạo signData theo đúng cách VNPay
  var signData = querystring.stringify(vnp_Params, { encode: true });
  console.log('Sign data:', signData);
  console.log('Sign data length:', signData.length);

  // Tạo hash SHA512 
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
  console.log('Generated hash:', signed);

  // Thêm hash vào params
  vnp_Params['vnp_SecureHash'] = signed;

  // Tạo final URL (encode: false như demo VNPay)
  const finalUrl = vnpUrl + '?' + qs.stringify(vnp_Params, { encode: true });
  
  console.log('Final URL:', finalUrl);
  console.log('==================');

  return finalUrl;
};

// Hàm verify callback từ VNPay
// export const verifyVnpayCallback = (query: Record<string, any>): boolean => {
//   const secretKey = process.env.VNP_HASH_SECRET!;
  
//   // Lấy hash từ VNPay
//   const vnp_SecureHash = query.vnp_SecureHash;
  
//   // Copy query và xóa hash fields
//   let vnp_Params = { ...query };
//   delete vnp_Params['vnp_SecureHash'];
//   delete vnp_Params['vnp_SecureHashType'];

//   // Sort object
//   vnp_Params = sortObject(vnp_Params);

//   // Tạo signData để verify
//   const signData = qs.stringify(vnp_Params, { encode: false });
//   console.log('Verify sign data:', signData);

//   // Tính hash
//   const hmac = crypto.createHmac("sha512", secretKey);
//   const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
  
//   console.log('Calculated hash:', signed);
//   console.log('Received hash:', vnp_SecureHash);

//   return vnp_SecureHash === signed;
// };