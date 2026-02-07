import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, category } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Interview chat - category:", category, "messages:", messages?.length);

    const categoryPrompts: Record<string, string> = {
      behavioral: `Focus on behavioral interview questions using the STAR method (Situation, Task, Action, Result). Ask about leadership, teamwork, conflict resolution, time management, and problem-solving experiences. Examples: "Tell me about a time you had to deal with a difficult team member", "Describe a situation where you failed and what you learned."`,
      
      technical: `Focus on technical concept questions for software engineering roles. Ask about data structures, algorithms, system design principles, databases, networking, operating systems, OOP concepts, design patterns, and software architecture. Examples: "Explain the difference between a stack and a queue", "What is the CAP theorem?", "How does garbage collection work?"`,
      
      coding: `Focus on coding and programming questions. Present actual coding problems with clear input/output examples. Format code using markdown code blocks. Ask about arrays, strings, linked lists, trees, graphs, dynamic programming, sorting, and searching. After the user answers, evaluate their solution's time and space complexity. Example: "Write a function to find the two numbers in an array that add up to a target sum. Input: nums = [2, 7, 11, 15], target = 9. Output: [0, 1]"`,
      
      "system-design": `Focus on system design interview questions. Ask about designing scalable systems, microservices, load balancing, caching, databases, message queues, and distributed systems. Examples: "Design a URL shortener like bit.ly", "How would you design a chat application like WhatsApp?", "Design a news feed system like Twitter."`,
      
      hr: `Focus on HR and general interview questions. Ask about career goals, strengths and weaknesses, salary expectations, company culture fit, and motivation. Examples: "Why do you want to work here?", "Where do you see yourself in 5 years?", "What is your greatest weakness?"`,
      
      mixed: `Mix questions from all categories: behavioral, technical, coding, system design, and HR. Vary the difficulty and type to simulate a real multi-round interview process.`,
    };

    const categoryInstruction = categoryPrompts[category] || categoryPrompts.mixed;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert tech interviewer conducting a realistic mock interview. Your job is to help candidates prepare for real tech interviews.

INTERVIEW STYLE:
- Ask ONE question at a time, just like a real interviewer
- Wait for the candidate's answer before asking the next question
- After each answer, provide brief constructive feedback (what was good, what could improve)
- Then ask a follow-up or new question
- Progressively increase difficulty
- Be professional but encouraging

CATEGORY FOCUS:
${categoryInstruction}

FORMATTING:
- Use markdown for code blocks with proper syntax highlighting (e.g. \`\`\`javascript, \`\`\`python)
- Bold key concepts and important terms
- Use numbered lists for multi-step explanations
- Keep feedback concise but actionable

EVALUATION:
- When evaluating coding answers, consider correctness, efficiency, edge cases, and code quality
- For behavioral answers, check for STAR method usage and specificity
- For system design, evaluate scalability, trade-offs, and completeness
- Provide a brief score hint (Strong/Good/Needs Improvement) after each answer

START: Begin by introducing yourself as the interviewer, mention the interview category, and ask your first question. Keep it natural and conversational.`
          },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in interview-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
