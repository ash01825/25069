import MainLayout from './layouts/MainLayout';

const PlaceholderInputPanel = () => (
    <div className="text-center text-gray-400 py-24">Input Panel</div>
);

const PlaceholderResultsPanel = () => (
    <div className="text-center text-gray-400 py-16">Results Panel</div>
);

const PlaceholderVisualsPanel = () => (
    <div className="text-center text-gray-400 py-16">Visuals Panel</div>
);

function App() {
    return (
        <MainLayout
            inputPanel={<PlaceholderInputPanel />}
            resultsPanel={<PlaceholderResultsPanel />}
            visualsPanel={<PlaceholderVisualsPanel />}
        />
    );
}

export default App;