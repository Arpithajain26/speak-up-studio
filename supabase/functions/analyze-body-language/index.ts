import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a professional public speaking coach analyzing body language from video frames.
Analyze the image and provide feedback on:
1. Posture - Is the person standing/sitting straight? Shoulders back? Confident stance?
2. Eye Contact - Are they looking at the camera (simulating audience contact)?
3. Gestures - Are hand movements purposeful, natural, or distracting?
4. Facial Expression - Is the expression engaging and appropriate?
5. Overall Presence - Does the person appear confident and professional?

Be encouraging but constructive. Provide specific, actionable tips.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this frame from a practice speaking session and provide body language feedback."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_body_language_feedback",
              description: "Provide structured body language feedback",
              parameters: {
                type: "object",
                properties: {
                  postureScore: {
                    type: "number",
                    description: "Score from 0-100 for posture"
                  },
                  postureFeedback: {
                    type: "string",
                    description: "Specific feedback about posture"
                  },
                  eyeContactScore: {
                    type: "number",
                    description: "Score from 0-100 for eye contact"
                  },
                  eyeContactFeedback: {
                    type: "string",
                    description: "Specific feedback about eye contact"
                  },
                  gesturesScore: {
                    type: "number",
                    description: "Score from 0-100 for gestures"
                  },
                  gesturesFeedback: {
                    type: "string",
                    description: "Specific feedback about gestures and hand movements"
                  },
                  expressionScore: {
                    type: "number",
                    description: "Score from 0-100 for facial expression"
                  },
                  expressionFeedback: {
                    type: "string",
                    description: "Specific feedback about facial expression"
                  },
                  overallScore: {
                    type: "number",
                    description: "Overall body language score from 0-100"
                  },
                  overallFeedback: {
                    type: "string",
                    description: "Overall assessment and key improvement areas"
                  },
                  topTips: {
                    type: "array",
                    items: { type: "string" },
                    description: "Top 3 actionable tips for improvement"
                  }
                },
                required: [
                  "postureScore", "postureFeedback",
                  "eyeContactScore", "eyeContactFeedback",
                  "gesturesScore", "gesturesFeedback",
                  "expressionScore", "expressionFeedback",
                  "overallScore", "overallFeedback", "topTips"
                ]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_body_language_feedback" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const feedback = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify(feedback),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Failed to parse AI response");
  } catch (error) {
    console.error("analyze-body-language error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
