import Link from "next/link";

// Segnaposto della home: la home vera (3D, taglio a 45°, pellicola) è la Fase 3.
export default function Home() {
  return (
    <main className="mx-auto grid max-w-2xl gap-4 px-4 py-16">
      <p className="text-sm uppercase tracking-widest text-interior-red">Cantiere aperto</p>
      <h1 className="text-4xl font-bold text-interior-blue">Il nuovo sito di WOW si sta stendendo.</h1>
      <p>Per ora c&apos;è il catalogo delle foto e dei video dei lavori.</p>
      <Link className="underline" href="/styleguide/media/">
        Apri il catalogo media
      </Link>
    </main>
  );
}
