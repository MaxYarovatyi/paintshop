export default function PageContainer({
    children,
    className=""
}: {
    children: React.ReactNode;
    className?: string;
})
{
    return <div className={`mx-auto max-w-content px-6 md:px-10 ${className}`}>{children}</div>
}