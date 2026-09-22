"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * useTabManager — logika reusable untuk tab pengujian substantif (dipakai lintas card:
 * Piutang, Kas, Persediaan, dst).
 *
 * Fitur:
 * 1. Lazy keep-alive  — tab hanya di-mount saat pertama dibuka, lalu tetap hidup
 *    (disembunyikan lewat CSS), jadi pindah tab tidak memicu fetch ulang.
 * 2. Persist di URL   — tab aktif disimpan di ?tab=... supaya bertahan setelah refresh.
 * 3. Targeted refetch — saat sebuah tab menyimpan data, hanya tab yang bergantung
 *    (sesuai depGraph) yang di-refetch, lewat "token" yang naik.
 *
 * @param {Object}  options
 * @param {string[]} options.tabKeys    Daftar key tab, contoh: ["prosedur", "dokumen", ...].
 * @param {Object}   [options.depGraph] Peta { tabSumber: [tab yang harus refetch] }.
 * @param {string}   [options.defaultTab] Tab awal jika ?tab= tidak ada / tidak valid.
 * @param {string}   [options.queryKey="tab"] Nama query param di URL.
 *
 * @returns {{
 *   activeTab: string,
 *   openTab: (key: string) => void,
 *   isTabMounted: (key: string) => boolean,
 *   isTabActive: (key: string) => boolean,
 *   tokenOf: (key: string) => number,
 *   notifySaved: (sourceKey: string) => void,
 *   panelClassName: (key: string) => string,
 * }}
 */
export default function useTabManager({
  tabKeys,
  depGraph = {},
  defaultTab,
  queryKey = "tab",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const validKeys = useMemo(() => new Set(tabKeys), [tabKeys]);
  const fallbackTab = defaultTab ?? tabKeys[0];

  const tabFromUrl = searchParams.get(queryKey);
  const initialTab = validKeys.has(tabFromUrl) ? tabFromUrl : fallbackTab;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [mountedTabs, setMountedTabs] = useState(() => new Set([initialTab]));
  const [refetchVersion, setRefetchVersion] = useState({});

  const openTab = (tabKey) => {
    if (!validKeys.has(tabKey)) return;

    setActiveTab(tabKey);
    setMountedTabs((current) => {
      if (current.has(tabKey)) return current;
      const next = new Set(current);
      next.add(tabKey);
      return next;
    });

    // Sinkronkan URL tanpa reload agar tab bertahan saat refresh.
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set(queryKey, tabKey);
    router.replace(`?${nextParams.toString()}`, { scroll: false });
  };

  // Dipanggil tab sumber setelah simpan berhasil. Menaikkan token tab-tab dependennya.
  const notifySaved = (sourceKey) => {
    const dependents = depGraph[sourceKey] ?? [];
    if (dependents.length === 0) return;

    setRefetchVersion((current) => {
      const next = { ...current };
      dependents.forEach((depKey) => {
        next[depKey] = (next[depKey] ?? 0) + 1;
      });
      return next;
    });
  };

  const tokenOf = (key) => refetchVersion[key] ?? 0;
  const isTabMounted = (key) => mountedTabs.has(key);
  const isTabActive = (key) => activeTab === key;
  const panelClassName = (key) => (activeTab === key ? "" : "hidden");

  return {
    activeTab,
    openTab,
    isTabMounted,
    isTabActive,
    tokenOf,
    notifySaved,
    panelClassName,
  };
}
