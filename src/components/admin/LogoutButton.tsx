"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
    >
      Log out
    </button>
  );
}
