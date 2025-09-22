export default function Container({ children, isHome }) {
    return <div className={`container mx-auto px-6 pt-20 md:pt-24 pb-8 md:px-8`}>{children}</div>
}
