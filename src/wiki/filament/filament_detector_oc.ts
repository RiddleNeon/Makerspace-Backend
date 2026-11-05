import * as dotenv from 'dotenv';

dotenv.config({ path: "./.env" });

export async function detect_filament_type(description: string): Promise<string> {
  const response = await fetch("https://opencode.ai/api/experimental/generate/decisions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENCODE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: {
        providerID: "openrouter",
        id: "typesafe/jev-router"
      },
      state: {
        customer_tier: "worker",
        ticket: description
      },
      questions: {
        filament_type: {
          type: "choice",
          instructions: "Which Filament type should be used to 3d-print the provided idea / model?",
          criteria: {
            PLA: "The most popular, low-warping filament ideal for visual prototypes and detailed models. It is highly brittle, has very low heat resistance (deforms above 55°C), and is unsafe for mechanical loads or functional outdoor use.",
            PETG: "A chemical-resistant material for general outdoor and functional parts. While tough under gradual stress, it fails brittly and shatters into sharp shards under sudden, high-velocity impacts, making it unsafe for protective gear.",
            ABS: "A rigid, highly impact-resistant plastic ideal for automotive and hot environments. It is prone to severe warping, releases toxic fumes during printing, and requires a heated enclosure to prevent critical interlayer splitting.",
            ASA: "An advanced alternative to ABS with identical mechanical strength and high heat deflection. It features exceptional UV and weather resistance, preventing degradation and color fading during long-term outdoor exposure.",
            TPU: "A highly flexible, wear-resistant elastomer that absorbs vibration and high-velocity impacts through elastic deformation. Ideal for gaskets, tires, and shock-absorbing protective gear liners, though difficult to print on Bowden extruders.",
            Nylon: "An incredibly durable engineering polymer with exceptional abrasion resistance and low surface friction. It yields ultra-tough, flexible mechanical components like gears, but is highly hygroscopic and warps heavily without proper drying.",
            PC: "An ultra-strong, structurally rigid material providing the highest heat deflection and maximum impact resistance without shattering. It requires extreme printing temperatures and is the industry standard for high-stress protective shells."
          }
        },
        is_safe_to_print: {
          type: "noul",
          instructions: "is the provided idea safe to print? Could there be bacteria or safety problems?",
          criteria: {
            true: "The provided idea is safe to print with the correct filament type.",
            false: "The provided idea is not safe to print, due to bacteria, health, safety or other problems"
          }
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenCode API request failed with status ${response.status}`);
  }

  const data = await response.json();
  console.log(`RESPONSE:`, data);

  return "success";
}
