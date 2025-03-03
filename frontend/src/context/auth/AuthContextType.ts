import { User } from "../../types";
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const defaultAuthContext: AuthContextType = {
  user: null,
  loading: false,
  error: null,
  register: async () => {},
  login: async () => {},
  logout: () => {},
};
