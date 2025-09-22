export default function Container({ children, isHome }) {
    // Standardize left/right padding and add extra top spacing so content sits below fixed header
    // Use a modest padding on small screens and larger on md+ screens for consistency
    const mobilePadding = 'px-6'
    return <div className={`container mx-auto ${mobilePadding} pt-20 md:pt-24 pb-8 md:px-8`}>{children}</div>
}
