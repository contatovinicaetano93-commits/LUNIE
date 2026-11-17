import type { Metadata } from "next";

import { LoginForm } from "@/components/login-form";
import { LunieMark } from "@/components/lunie-mark";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesso à área administrativa da LUNIE.",
};

export const instant = false;

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const nextRaw = params.next;
  const next =
    typeof nextRaw === "string" && nextRaw.startsWith("/admin")
      ? nextRaw
      : "/admin";

  return (
    <div className="flex min-h-full items-center justify-center bg-[linear-gradient(160deg,#14110f_0%,#2a221c_48%,#1a1613_100%)] px-4 py-16 text-[#f4efe8]">
      <div className="w-full max-w-md">
        <div className="mb-10 flex flex-col items-center text-center">
          <LunieMark className="bg-[#f4efe8]" />
          <p className="mt-4 text-xs tracking-[0.35em] uppercase text-[#f4efe8]/70">
            Área administrativa
          </p>
        </div>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
