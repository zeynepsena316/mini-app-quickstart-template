"use client";

import React from "react";
import Game from "./Game";

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <Game />
      </div>
    </main>
  );
}
