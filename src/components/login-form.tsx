"use client";

import { useActionState } from "react";

import { loginAction, type LoginState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-sm border border-white/15 bg-black/25 p-6 backdrop-blur-sm"
    >
      <input type="hidden" name="next" value={next} />
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#f4efe8]/80">
          E-mail
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="border-white/20 bg-black/30 text-[#f4efe8] placeholder:text-white/35"
          placeholder="seu@email.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-[#f4efe8]/80">
          Senha
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="border-white/20 bg-black/30 text-[#f4efe8] placeholder:text-white/35"
        />
      </div>
      {state.error ? (
        <p className="text-sm text-[#e8b4a0]" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={pending}
        className="w-full rounded-none bg-[#f4efe8] text-[#1a1613] hover:bg-white"
      >
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
