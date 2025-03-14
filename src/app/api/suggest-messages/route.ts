import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    const response = await openai.completions.create({
      model: "gpt-4o-turbo-instruct",
      prompt,
      max_tokens: 400,
      stream: true,
    });

    const stream = new ReadableStream({
        async  start(controller) {
            const reader = response[Symbol.asyncIterator]()

            for await (const chunk of reader) {
                controller.enqueue(new TextEncoder().encode(chunk.text))
            }
            controller.close()
        }
    })

    return new NextResponse(stream)

   
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const { name, status, headers, message } = error;
      console.error(`OpenAI API Error: ${message}`, { name, status, headers });
      return NextResponse.json({ name, status, headers, message }, { status });
    } else {
      console.error("An unexpected error occurred:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  }
}
