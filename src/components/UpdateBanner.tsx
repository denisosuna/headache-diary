import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

/**
 * Banner sutil que aparece cuando el service worker detecta una nueva versión
 * de la app. Al pulsar "Actualizar" se activa el nuevo SW y recarga la página.
 * También muestra un aviso transitorio cuando la app queda lista para uso offline.
 */
export function UpdateBanner() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateFn, setUpdateFn] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const update = registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        setOfflineReady(true);
        setTimeout(() => setOfflineReady(false), 4000);
      },
    });
    setUpdateFn(() => update);
  }, []);

  if (!needRefresh && !offlineReady) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      {needRefresh ? (
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm shadow-lg">
          <span className="text-slate-700">Nueva versión disponible</span>
          <button
            type="button"
            onClick={() => updateFn?.()}
            className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800"
          >
            Actualizar
          </button>
          <button
            type="button"
            onClick={() => setNeedRefresh(false)}
            className="text-xs text-slate-400 hover:text-slate-600"
            aria-label="Descartar"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="pointer-events-auto rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 shadow-md">
          Lista para usar sin conexión
        </div>
      )}
    </div>
  );
}
