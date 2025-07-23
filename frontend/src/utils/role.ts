export const getRoleName = (roleId: number | undefined) => {
  switch (roleId) {
    case 1:
      return "Admin";
    case 2:
      return "Guest";
    case 3:
      return "Host";
    default:
      return "Not specified";
  }
};