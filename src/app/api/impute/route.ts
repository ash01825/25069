import { NextResponse } from 'next/server';

/**
 * API Contract: The exact shapes of data flowing in and out.
 * This is the blueprint for the frontend and backend.
 * Dev B must share this with Dev A.
 */

// This is what the frontend will send in the POST request body.
interface ProjectInput {
    name: string;
    // Example structure, can be expanded.
    components: {
        id: string;
        mass: number;
        // Other fields the frontend might send...
        [key: string]: any;
    }[];
}

// This is what our API will always return on success.
interface ImputationResponse {
    project_imputed: ProjectInput;
    imputation_meta: {
        field: string;
        method: string;
        confidence: number;
        source: string;
    }[];
}

/**
 * This is the Route Handler for POST /api/impute.
 * For Day 1, it only echoes the request back in the correct shape.
 */
export async function POST(request: Request) {
    try {
        // 1. Parse the incoming request body.
        const body = await request.json();
        const projectData: ProjectInput = body.project;

        // A quick validation to ensure the 'project' key exists.
        if (!projectData) {
            return NextResponse.json({ error: "Missing 'project' key in request body" }, { status: 400 });
        }

        console.log("✅ [API /api/impute] Received project data:", projectData);

        // 2. --- DAY 1 MOCK LOGIC ---
        // We are not performing any real imputation. We simply prepare a
        // response that matches the API contract using the data we received.
        const mockResponse: ImputationResponse = {
            project_imputed: projectData, // Echoing the input back.
            imputation_meta: [           // Sending mock metadata.
                {
                    field: "component.energy_kWh_per_kg",
                    method: "mock_placeholder",
                    confidence: 0.5,
                    source: "Day 1 API Skeleton"
                },
                {
                    field: "component.transport_km_per_kg",
                    method: "mock_placeholder",
                    confidence: 0.5,
                    source: "Day 1 API Skeleton"
                }
            ]
        };

        // 3. Send the successful response back to the client.
        return NextResponse.json(mockResponse);

    } catch (error) {
        // Basic error handling.
        console.error("❌ [API /api/impute] Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}