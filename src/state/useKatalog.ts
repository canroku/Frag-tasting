// Katalog tembel yüklendiğinde ekranların yeniden hesaplaması için sürüm hook'u
import { useSyncExternalStore } from "react";
import { katalogDinle, katalogSurumu } from "../data/catalog";

export function useKatalogSurumu(): number {
  return useSyncExternalStore(katalogDinle, katalogSurumu);
}
