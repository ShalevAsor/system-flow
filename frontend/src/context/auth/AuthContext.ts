// contexts/auth/AuthContext.ts
import { createContext } from "react";
import { AuthContextType, defaultAuthContext } from "./AuthContextType";

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);
