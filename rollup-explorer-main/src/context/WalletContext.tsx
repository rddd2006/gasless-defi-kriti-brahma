import React, { createContext, useContext, useState } from "react";

type WalletContextType = {
  address: string | null;
  setAddress: (addr: string | null) => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {

  const [address, setAddress] = useState<string | null>(null);

  return (
    <WalletContext.Provider value={{ address, setAddress }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {

  const ctx = useContext(WalletContext);

  if (!ctx) {
    throw new Error("useWallet must be used inside WalletProvider");
  }

  return ctx;
}