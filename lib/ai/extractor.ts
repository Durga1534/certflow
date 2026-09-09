import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { coiExtractionSchema, type CoiExtractionResult } from "../validations/ai-extraction";

interface ProcessDocumentParams {
    fileBuffer: Buffer;
    mimeType: string;
}

export async function extractDocumentMetadata({
    fileBuffer,
    mimeType,
}: ProcessDocumentParams): Promise<CoiExtractionResult> {
    const base64Data = fileBuffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    const { object } = await generateObject({
        model: openai("gpt-4o"),
        schema: coiExtractionSchema,
        system: `You are an expert insurance compliance auditor. Extract key compliance metadata from the provided document image/PDF.
- If a value is missing or unreadable, mark it as null.
- Dates MUST be formatted as ISO strings: YYYY-MM-DD.
- Convert all monetary limits to plain integers/floats without currency symbols or commas.
- Set high confidence (0.8+) only when the vendor name and expiration dates are explicitly clear.`,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: "Extract insurance and compliance attributes from this certificate:",
                    },
                    {
                        type: "image",
                        image: dataUrl,
                    },
                ],
            },
        ],
    });

    return object;
}