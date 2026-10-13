"use client";

import { useEffect } from "react";

const ENGINE_SRC = "/js/app-1.0.12.js";

/**
 * Safely loads the legacy full-page animation engine (`/js/app-1.0.12.js`)
 * inside the Next.js App Router.
 *
 * Why this hook exists
 * --------------------
 * `app-1.0.12.js` is a singleton PJAX engine: it takes over the whole
 * document with its own history router and a full-screen `#loader` overlay
 * that it only hides *after* it finishes booting. That design fights with
 * Next.js client-side routing and produced these bugs on the team pages:
 *
 *   1. The green `#loader` stayed on screen until a manual refresh, because
 *      on a client-side navigation the engine never re-booted to hide it.
 *   2. The URL changed but the page didn't, because the engine intercepts
 *      link clicks and calls `history.pushState` itself (its PJAX nav can't
 *      actually swap the React-rendered DOM).
 *   3. Injecting the script again on every navigation ran a *second* copy of
 *      the singleton, so two routers/loaders fought each other.
 *
 * What this hook does
 * -------------------
 *   1. Boots the engine at most once per document (no duplicate singletons).
 *   2. Neutralises the engine's PJAX router: any attempt to push a *different*
 *      path is turned into a real browser navigation, so every engine page
 *      loads fresh and the URL and content stay in sync.
 *   3. On the homepage, allows the loader intro animation then dismisses it.
 *   4. On ALL other pages (team profiles, about-us, etc.) the loader is
 *      force-hidden IMMEDIATELY and a MutationObserver keeps it hidden even
 *      if the engine script tries to re-show it — solving the production
 *      timing race where the engine loads before our setTimeout fires.
 */
export function useNewpageEngine() {
  useEffect(() => {
    // ---- SPA-arrival guard (defense in depth) ----
    // The engine is a full-document DOM manipulator: it re-parents nodes
    // (wraps imgs, moves containers) that React believes it owns. Booting
    // it mid-React-session — i.e. when this page was mounted by a
    // client-side navigation instead of a real page load — makes the next
    // React commit throw NotFoundError insertBefore/removeChild ("a
    // client-side exception has occurred"). The (newpage) layout sets
    // __mkHardLoad via an inline script on every true document load; if
    // it's missing, we arrived via SPA nav: hide the loader and DO NOT
    // boot the engine. (The login pages additionally hard-navigate to "/"
    // so the normal post-login experience keeps its full animations.)
    const hardLoad = (window as any).__mkHardLoad === true;
    const forceHideLoaderAny = () => {
      const loader = document.getElementById("loader");
      if (loader) {
        loader.style.cssText =
          "display:none!important;opacity:0!important;pointer-events:none!important;";
      }
      const interloader = document.getElementById("interloader");
      if (interloader) {
        interloader.classList.add("hidden");
        interloader.style.cssText = "display:none!important;";
      }
    };
    if (!hardLoad) {
      forceHideLoaderAny();
      return;
    }

    // ---- Determine page type up-front ----
    // Only the homepage has a HomepageLanding component that needs the engine
    // intro animation. Every other page must suppress the loader immediately.
    const isLandingPage = !!document.querySelector(
      '[data-component="HomepageLanding"]',
    );

    // ---- Loader helpers ----
    const forceHideLoader = () => {
      const loader = document.getElementById("loader");
      if (loader) {
        loader.style.cssText =
          "display:none!important;opacity:0!important;pointer-events:none!important;";
      }
      const interloader = document.getElementById("interloader");
      if (interloader) {
        interloader.classList.add("hidden");
        interloader.style.cssText = "display:none!important;";
      }
    };

    const dismissLoader = () => {
      const loader = document.getElementById("loader");
      if (loader && loader.style.display !== "none") {
        loader.style.transition = "opacity 0.45s ease";
        loader.style.opacity = "0";
        loader.style.pointerEvents = "none";
        window.setTimeout(() => {
          loader.style.display = "none";
        }, 500);
      }
      const interloader = document.getElementById("interloader");
      if (interloader) {
        interloader.classList.add("hidden");
        interloader.style.display = "none";
      }
    };

    // ---- Non-landing pages: suppress loader immediately and persistently ----
    // On production the engine script can load at any time relative to React.
    // We must hide the loader NOW (synchronously) and watch it so the engine
    // cannot bring it back.
    let loaderObserver: MutationObserver | null = null;
    if (!isLandingPage) {
      // Hide it right away — this runs synchronously in the effect, before the
      // engine script is even injected.
      forceHideLoader();

      // Watch the loader element: if the engine (or anything else) changes its
      // style or class and makes it visible, immediately hide it again.
      const loader = document.getElementById("loader");
      if (loader) {
        loaderObserver = new MutationObserver(() => {
          // If the engine made the loader visible again, kill it.
          const isVisible =
            loader.style.display !== "none" &&
            loader.style.opacity !== "0" &&
            !loader.classList.contains("hidden");
          if (isVisible) {
            forceHideLoader();
          }
        });
        loaderObserver.observe(loader, {
          attributes: true,
          attributeFilter: ["style", "class"],
        });
      }
    }

    // ---- Neutralise the engine's PJAX router ----
    // If anything tries to push a route with a different pathname, perform a
    // real navigation instead so the destination boots a clean engine.
    const originalPushState = window.history.pushState.bind(window.history);
    window.history.pushState = function (
      data: unknown,
      unused: string,
      url?: string | URL | null,
    ) {
      if (url != null) {
        try {
          const target = new URL(String(url), window.location.href);
          if (target.pathname !== window.location.pathname) {
            window.location.assign(target.href);
            return;
          }
        } catch {
          /* malformed URL – fall through to native behaviour */
        }
      }
      return originalPushState(data, unused, url);
    };

    // ---- Boot the engine exactly once per document ----
    const win = window as unknown as { __mkEngineBooted?: boolean };
    if (win.__mkEngineBooted) {
      // Already running (e.g. React StrictMode double-mount in dev).
      if (isLandingPage) dismissLoader();
      // Non-landing: MutationObserver above already covers it.
    } else {
      win.__mkEngineBooted = true;
      const existing = document.querySelector<HTMLScriptElement>(
        'script[data-mk-engine="true"]',
      );
      if (!existing) {
        const script = document.createElement("script");
        script.src = ENGINE_SRC;
        script.async = true;
        script.dataset.mkEngine = "true";
        if (isLandingPage) {
          // Let the engine play its intro animation, then clear the loader.
          script.addEventListener("load", () => {
            window.setTimeout(dismissLoader, 2000);
          });
          script.addEventListener("error", dismissLoader);
        }
        // Non-landing: no load listener needed — the MutationObserver handles it.
        document.body.appendChild(script);
      }
    }

    // ---- Hard cap for homepage only ----
    // Sub-pages are handled by the MutationObserver so no cap needed there.
    let hardTimeout: number | null = null;
    if (isLandingPage) {
      hardTimeout = window.setTimeout(dismissLoader, 6000);
    }

    return () => {
      if (hardTimeout !== null) window.clearTimeout(hardTimeout);
      if (loaderObserver) loaderObserver.disconnect();
      window.history.pushState = originalPushState;
    };
  }, []);
}

export default useNewpageEngine;
