export default function About() {
    return (
        <>
            <h1 className="text-3xl font-bold mb-8 md:mb-12 mt-6 md:mt-12 text-white">About Us</h1>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16">
                <div>
                    <h2 className="text-2xl font-semibold text-white">Our mission</h2>
                    <p className="text-muted mt-3">We are a small team building modern, project-based courses for learners worldwide. Our mission is to make high-quality education accessible and practical.</p>
                </div>
                <div>
                    <img src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder" alt="about" className="w-full h-56 object-cover rounded-lg" />
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16">
                <div className="order-2 md:order-1">
                    <img src="https://images.unsplash.com/photo-1556767576-5ec41e3239ea?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder" alt="team" className="w-full h-56 object-cover rounded-lg" />
                </div>
                <div className="order-1 md:order-2">
                    <h2 className="text-2xl font-semibold text-white">What we teach</h2>
                    <p className="text-muted mt-3">Practical, project-driven courses focused on building portfolio-ready projects and real skills employers look for.</p>
                </div>
            </section>
            <section>
                <h2 className="text-2xl font-semibold text-white mb-4 mt-6">Our values</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 bg-dark-800 rounded-lg border border-dark-700">
                        <h3 className="font-semibold text-white">Quality</h3>
                        <p className="text-muted mt-2">High production value and accurate, up-to-date curricula.</p>
                    </div>
                    <div className="p-6 bg-dark-800 rounded-lg border border-dark-700">
                        <h3 className="font-semibold text-white">Practicality</h3>
                        <p className="text-muted mt-2">Hands-on projects that teach real-world skills.</p>
                    </div>
                    <div className="p-6 bg-dark-800 rounded-lg border border-dark-700">
                        <h3 className="font-semibold text-white">Accessibility</h3>
                        <p className="text-muted mt-2">Affordable and concise learning paths for everyone.</p>
                    </div>
                </div>
            </section>
        </>
    )
}
