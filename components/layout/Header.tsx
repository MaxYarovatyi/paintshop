import Link from "next/link";
import Nav from "./Nav";

export default function Header() {
    return (
        <header className="mx-auto max-w-content px-6 md:px-10 py-6 flex items-center justify-between">
            <Link href="/" className="font-serif text-xl tracking-tight">
                Gallery { }
            </Link>
            <Nav />
        </header>
    )
}