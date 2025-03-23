import React, { createContext, ReactNode, useState } from "react";
type UserContextType = {
  hasModelResponse: boolean;
  setHasModelResponse: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [hasModelResponse, setHasModelResponse] = useState(false);
  return (
    <UserContext.Provider value={{ hasModelResponse, setHasModelResponse }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
