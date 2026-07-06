import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

const TELEGRAM_BOT_URL = "https://t.me/vidplusvideo_bot";

export const metadata: Metadata = {
  title: {
    absolute: SITE_NAME,
  },
};

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="120" cy="120" r="120" fill="#229ED9" />
      <path
        d="M81.5 118.5L168.5 77.5C172.5 75.5 176 77.5 174.5 83.5L158.5 168.5C157 174.5 153.5 175.5 149 173L115 148.5L99 163.5C97.5 165 96 165 94.5 164L97.5 128.5L158 88.5C160 87 158 86 156 87.5L85.5 125.5L50.5 114.5C44.5 112.5 44.5 108.5 52 106L168 68C173 66 177.5 69.5 176 76L158.5 168.5C157.5 173.5 154.5 174.5 150.5 172L115 148.5"
        fill="white"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center text-center max-w-sm w-full">
        <TelegramIcon className="w-28 h-28 mb-10 drop-shadow-[0_0_40px_rgba(34,158,217,0.35)]" />

        <h1 className="text-white text-2xl font-bold tracking-tight mb-2">
          Vidplus+
        </h1>
        <p className="text-zinc-500 text-sm mb-10">
          Get your account through our Telegram bot
        </p>

        <a
          href={TELEGRAM_BOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2.5 bg-[#229ED9] hover:bg-[#1a8bc4] active:scale-[0.98] text-white font-semibold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-[#229ED9]/25"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
          </svg>
          Get Account
        </a>
      </div>
    </main>
  );
}
