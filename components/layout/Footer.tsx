export default function Footer() {
    return (
        <footer className="mt-24 border-t border-neutral-200">
            <div className="mx-auto max-w-content px-6 md:px-10 py-10 text-sm text-neutral-500 flex justify-between">
                <span> {new Date().getFullYear()} Gallery</span>
                <span>Shipping to Ukraine, Europe, USA</span>
            </div>
        </footer>
    )
}