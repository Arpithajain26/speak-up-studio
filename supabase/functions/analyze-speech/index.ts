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
    const { transcript } = await req.json();
    
    if (!transcript || transcript.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "No transcript provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing speech transcript for word patterns...");

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
            content: `You are a speech analysis expert helping students improve their English speaking skills. 
Analyze the transcript and identify:
1. Frequently repeated words (especially filler words like "so", "and", "um", "uh", "like", "you know", "basically", "actually", "literally", "right", "okay")
2. Overused connecting words
3. Patterns that indicate nervousness or lack of fluency
4. Specific suggestions for improvement

Be encouraging but honest. Focus on actionable feedback.`
          },
          {
            role: "user",
            content: `Analyze this speech transcript and identify word patterns:\n\n"${transcript}"`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_word_patterns",
              description: "Returns analysis of word patterns in speech",
              parameters: {
                type: "object",
                properties: {
                  repeatedWords: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        word: { type: "string" },
                        count: { type: "number" },
                        category: { type: "string", enum: ["filler", "connector", "habit", "other"] },
                        suggestion: { type: "string" }
                      },
                      required: ["word", "count", "category", "suggestion"]
                    }
                  },
                  overallFeedback: { type: "string" },
                  fluencyTips: {
                    type: "array",
                    items: { type: "string" }
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" }
                  },
                  vocabularyScore: { type: "number" }
                },
                required: ["repeatedWords", "overallFeedback", "fluencyTips", "strengths", "vocabularyScore"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_word_patterns" } }
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

    const data = await response.json();
    console.log("AI response received:", JSON.stringify(data, null, 2));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No analysis returned from AI");
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    console.log("Parsed analysis:", analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-speech:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
