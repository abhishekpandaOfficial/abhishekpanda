import { SiWhatsapp } from "react-icons/si";

const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/BIz1l1qK9lu1oZEIJOBmDS?mode=gi_t";

export const WhatsAppChatButton = () => {
  return (
    <div className="fixed bottom-5 right-4 z-50 md:bottom-6 md:right-6">
      <span className="pointer-events-none mb-2 hidden w-max rounded-full border border-border/60 bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm md:block">
        Need help? Chat with me
      </span>

      <a
        href={WHATSAPP_GROUP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with me on WhatsApp"
        className="group relative inline-flex items-center gap-2 rounded-full border border-emerald-300/55 bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(16,185,129,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-[0_24px_52px_-20px_rgba(16,185,129,0.82)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
      >
        <span className="relative inline-flex h-5 w-5 items-center justify-center">
          <span className="absolute inline-flex h-5 w-5 animate-ping rounded-full bg-emerald-200/50" />
          <SiWhatsapp className="relative h-5 w-5" aria-hidden="true" />
        </span>
        <span>Chat with me</span>
        <span className="sr-only">Open WhatsApp group chat</span>
      </a>
    </div>
  );
};
