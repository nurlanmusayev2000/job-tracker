import { messages } from "@/messages";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-3 px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        {messages.app.name}
      </h1>
      <p className="text-lg text-slate-700 dark:text-slate-300">
        {messages.app.description}
      </p>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {messages.home.underConstruction}
      </p>
    </main>
  );
}
