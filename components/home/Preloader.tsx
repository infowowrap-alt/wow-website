import { Logo } from "@/components/ui/Logo";

// Il preloader (1,4 s, solo alla prima visita della sessione): una spatola passa
// e "stende" il logo WOW, poi il foglio si stacca in diagonale. Il logo non si
// tocca: si anima solo la maschera che lo scopre. È tutto CSS, quindi parte
// subito, senza aspettare il JavaScript. Con "riduci movimento" non compare.
const SKIP = `try{if(sessionStorage.getItem("wow-intro")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("wow-intro-seen");sessionStorage.setItem("wow-intro","1")}catch(e){}`;

export function Preloader() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SKIP }} />
      <div className="wow-intro wow-liner" aria-hidden="true">
        <div className="wow-intro__stage">
          <div className="wow-intro__logo">
            <Logo variant="wow" width={260} priority className="w-[180px] sm:w-[260px]" />
          </div>
          <span className="wow-intro__squeegee" />
        </div>
      </div>
    </>
  );
}
