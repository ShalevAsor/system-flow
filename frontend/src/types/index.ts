export enum StorageKeys {
  TOKEN = "userToken",
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}
