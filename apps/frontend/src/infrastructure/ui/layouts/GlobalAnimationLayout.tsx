"use client";

import { PropsWithChildren, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

const GlobalAnimationLayout = ({ children }: PropsWithChildren): JSX.Element => {
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (!scopeRef.current) {
      return;
    }

    const context = gsap.context(() => {
      const shellTargets = gsap.utils.toArray<HTMLElement>("[data-rura-shell]");
      const staggerTargets = gsap.utils.toArray<HTMLElement>("[data-rura-stagger]");

      if (shellTargets.length === 0 && staggerTargets.length === 0) {
        return;
      }

      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out"
        }
      });

      if (shellTargets.length > 0) {
        timeline.fromTo(
          shellTargets,
          { opacity: 0, y: 14, filter: "blur(6px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7 }
        );
      }

      if (staggerTargets.length > 0) {
        timeline.fromTo(
          staggerTargets,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, stagger: 0.08, duration: 0.4 },
          shellTargets.length > 0 ? "-=0.3" : 0
        );
      }
    }, scopeRef);

    return () => {
      context.revert();
    };
  }, [pathname]);

  return (
    <div ref={scopeRef} className="min-h-screen" data-rura-shell>
      {children}
    </div>
  );
};

export default GlobalAnimationLayout;