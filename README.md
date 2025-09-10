# LCA Tool: Life Cycle Assessment for Ores

This project is a Life Cycle Assessment (LCA) tool for evaluating the environmental impact of metal production, specifically aluminium and copper. It calculates key metrics such as CO2 emissions, energy use, and water consumption based on user inputs and scientific/industry data.

## Features
- Interactive frontend for user input and results visualization
- TypeScript-based LCA engine for accurate calculations
- Modular, testable codebase
- Data-driven: easily extendable to more metals or factors

## Project Structure

```
25069/
├── frontend.html           # Main web interface
├── src/
│   ├── types.ts           # TypeScript types and interfaces
│   ├── data/
│   │   └── lcaFactors.json # LCA factors/constants for metals
│   └── lib/
│       ├── lcaEngine.ts   # Core LCA calculation logic
│       └── lcaEngine.test.ts # Unit tests for the engine
├── tsconfig.json          # TypeScript configuration
├── package.json           # Project dependencies and scripts
├── .gitignore             # Git ignore rules
├── LICENSE                # Project license
└── README.md              # Project documentation
```

## How It Works
1. **User Input:** Users specify metal type, recycled content, transport distance, energy mix, and end-of-life recovery.
2. **Calculation:** The LCA engine uses these inputs and static factors from `lcaFactors.json` to compute:
	- Total CO2e emissions
	- Total energy use
	- Water consumption
	- Circularity index
3. **Results:** Outputs are visualized in the frontend and available for further analysis.

## Getting Started
1. Clone the repository.
2. Install dependencies with `npm install` (if using Node.js/TypeScript tooling).
3. Open `frontend.html` in your browser to use the tool.
4. Run tests with `npm test` (if configured).

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
See the `LICENSE` file for license information.
