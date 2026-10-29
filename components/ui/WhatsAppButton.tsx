import { Button } from "./Button";
import { WHATSAPP_MESSAGES, whatsappLink, type World } from "@/lib/contact";

export function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  );
}

type Props = {
  world: World | "home";
  /** Testo del bottone; il messaggio precompilato dipende dal mondo. */
  label?: string;
  message?: string;
  className?: string;
};

export function WhatsAppButton({ world, label = "Mandaci una foto su WhatsApp", message, className }: Props) {
  return (
    <Button href={whatsappLink(message ?? WHATSAPP_MESSAGES[world])} icon={<WhatsAppIcon />} className={className}>
      {label}
    </Button>
  );
}

/** Bottone fisso in basso a destra, sempre presente, con il messaggio del mondo corrente. */
export function WhatsAppFloating({ world }: { world: World | "home" }) {
  return (
    <a
      href={whatsappLink(WHATSAPP_MESSAGES[world])}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Scrivici su WhatsApp"
      className="wow-floating"
    >
      <WhatsAppIcon size={26} />
    </a>
  );
}
