export function isValidEmail(email: string): boolean { // check valid email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export function isValidDob(dobInput: string | Date): boolean {
  const dob = dobInput instanceof Date ? dobInput : new Date(dobInput);
  const now = new Date();
  const minAge = 18;
  const maxAge = 120;

  if (isNaN(dob.getTime()) || dob > now) return false;

  const age = now.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    now.getMonth() > dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() >= dob.getDate());

  const actualAge = hasHadBirthdayThisYear ? age : age - 1;

  return actualAge >= minAge && actualAge <= maxAge;
}

export function isValidGender(gender: string): boolean { // check valid gender
  const validGenders = ["male", "female", "gei"];
  return validGenders.includes(gender.toLowerCase());
}

export function isValidVietnamPhoneNumber(phone: string): boolean { // check valid mobile phone number
  const vietnamPhoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
  return vietnamPhoneRegex.test(phone);
}