import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        {children}
      </main>
      <Footer />
    </>
  );
}
