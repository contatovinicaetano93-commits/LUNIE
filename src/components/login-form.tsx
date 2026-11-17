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
      className="space-y-5 border border-[#967565]/35 bg-[#e9ddce]/80 p-6 backdrop-blur-sm"
    >
      <input type="hidden" name="next" value={next} />
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#664637]/80">
          E-mail
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="border-[#cbb49b] bg-[#f3ebe0] text-[#664637] placeholder:text-[#967565]/60"
          placeholder="seu@email.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-[#664637]/80">
          Senha
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="border-[#cbb49b] bg-[#f3ebe0] text-[#664637]"
        />
      </div>
      {state.error ? (
        <p className="text-sm text-[#b76d50]" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={pending}
        className="w-full rounded-none bg-[#664637] text-[#e9ddce] hover:bg-[#b76d50]"
      >
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
