import Link from "next/link";
import Nav from "./Nav";
import PageContainer from "./PageContainer";

export default function Header() {
    return (
        <header className="py-6 border-b border-canvas-border z-40">
            <PageContainer className="flex items-center justify-between relative">
            <Link href="/" className="font-serif text-xl tracking-tight text-ink">
                Gallery { }
            </Link>
            <Nav />
            </PageContainer>
        </header>
    )
}