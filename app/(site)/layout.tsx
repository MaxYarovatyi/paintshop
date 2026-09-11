import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/motion/PageTransition";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <main className="mx-auto max-w-content px-6 md:px-10">
                <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
        </>
    )
}