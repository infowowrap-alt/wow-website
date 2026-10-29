"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import type { World } from "@/lib/contact";
import { useWorldTransition } from "./TransitionProvider";

// Un link verso un mondo: al clic parte la pellicola. Con i tasti modificatori
// (nuova scheda, nuova finestra) resta un link normale.
export function WorldLink({ world, href, onClick, ...props }: ComponentProps<typeof Link> & { world: World; href: string }) {
  const go = useWorldTransition();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    go(href, world);
  };
  return <Link href={href} onClick={handle} {...props} />;
}
