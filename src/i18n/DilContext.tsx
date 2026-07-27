// Dil bağlamı — otomatik tarayıcı diliyle başlar, tercih kalıcılaşır,
// Arapça için RTL uygulanır. t(anahtar) ile çeviri.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ceviriBul, tarayiciDili, RTL_DILLER, type Dil } from "./diller";

interface DilDegerleri {
  dil: Dil;
  setDil: (d: Dil) => void;
  t: (anahtar: string) => string;
}

const DilContext = createContext<DilDegerleri | null>(null);
const DIL_KEY = "frag_dil";

function baslangicDili(): Dil {
  const kayitli = localStorage.getItem(DIL_KEY) as Dil | null;
  if (kayitli) return kayitli;
  return tarayiciDili(); // ilk açılış: istemcinin diline göre
}

export function DilProvider({ children }: { children: ReactNode }) {
  const [dil, setDilState] = useState<Dil>(baslangicDili);

  useEffect(() => {
    document.documentElement.lang = dil;
    document.documentElement.dir = RTL_DILLER.includes(dil) ? "rtl" : "ltr";
    localStorage.setItem(DIL_KEY, dil);
  }, [dil]);

  const deger = useMemo<DilDegerleri>(
    () => ({ dil, setDil: setDilState, t: (anahtar: string) => ceviriBul(anahtar, dil) }),
    [dil]
  );

  return <DilContext.Provider value={deger}>{children}</DilContext.Provider>;
}

export function useDil(): DilDegerleri {
  const ctx = useContext(DilContext);
  if (!ctx) throw new Error("useDil, DilProvider içinde kullanılmalı");
  return ctx;
}
