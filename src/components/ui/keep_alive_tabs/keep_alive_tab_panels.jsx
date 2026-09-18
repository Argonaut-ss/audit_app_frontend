"use client";

/**
 * KeepAliveTabPanels — merender daftar panel tab dengan pola keep-alive.
 * Hanya panel yang sudah pernah dibuka yang di-mount; panel non-aktif disembunyikan
 * lewat CSS (tidak di-unmount), jadi state & data tiap tab tetap utuh.
 *
 * Dipakai bersama useTabManager.
 *
 * @param {Object} props
 * @param {{ key: string, element: React.ReactNode }[]} props.panels
 * @param {(key: string) => boolean} props.isTabMounted
 * @param {(key: string) => string}  props.panelClassName
 */
export default function KeepAliveTabPanels({ panels, isTabMounted, panelClassName }) {
  return (
    <>
      {panels.map(({ key, element }) =>
        isTabMounted(key) ? (
          <div key={key} className={panelClassName(key)}>
            {element}
          </div>
        ) : null
      )}
    </>
  );
}
