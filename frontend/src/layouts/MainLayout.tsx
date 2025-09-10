import React from 'react';

interface MainLayoutProps {
    inputPanel: React.ReactNode;
    resultsPanel: React.ReactNode;
    visualsPanel: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ inputPanel, resultsPanel, visualsPanel }) => {
    return (
        <main className="bg-gray-900 text-white min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-screen-xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400 tracking-wide">
                        CircleMetal
                    </h1>
                    <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
                        An interactive AI-driven Life Cycle Assessment tool to explore and improve the circularity of metal production.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <section className="lg:col-span-2 bg-gray-800/50 p-6 rounded-lg shadow-lg">
                        {inputPanel}
                    </section>

                    <div className="lg:col-span-3 flex flex-col gap-6">
                        <section className="bg-gray-800/50 p-6 rounded-lg shadow-lg">
                            {resultsPanel}
                        </section>
                        <section className="bg-gray-800/50 p-6 rounded-lg shadow-lg">
                            {visualsPanel}
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default MainLayout;