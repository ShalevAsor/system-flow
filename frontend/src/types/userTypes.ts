export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  token?: string;
}
