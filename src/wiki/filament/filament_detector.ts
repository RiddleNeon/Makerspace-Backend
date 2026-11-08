import { Env } from "../..";

export async function detect_filament_type(description: string, env: Env): Promise<{ filamentType: string, safety: number }> {
  console.log("API Key vorhanden?:", !!env.OPENROUTER_API_KEY);
  let response = await
    fetch("https://openrouter.ai/api/alpha/decisions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "typesafe/jev-1.14",
        "state": {
          "customer_tier": "worker",
          "ticket": description
        },
        "questions": {
          "filament_type": {
            "type": "choice",
            "instructions": "Which Filament type should be used to 3d-print the provided idea / model?",
            "criteria":
            {
              "PLA": "The most popular, low-warping filament ideal for visual prototypes and detailed models. It is highly brittle, has very low heat resistance (deforms above 55°C), and is unsafe for mechanical loads or functional outdoor use.",
              "PETG": "A chemical-resistant material for general outdoor and functional parts. While tough under gradual stress, it fails brittly and shatters into sharp shards under sudden, high-velocity impacts, making it unsafe for protective gear.",
              "ABS": "A rigid, highly impact-resistant plastic ideal for automotive and hot environments. It is prone to severe warping, releases toxic fumes during printing, and requires a heated enclosure to prevent critical interlayer splitting.",
              "ASA": "An advanced alternative to ABS with identical mechanical strength and high heat deflection. It features exceptional UV and weather resistance, preventing degradation and color fading during long-term outdoor exposure.",
              "TPU": "A highly flexible, wear-resistant elastomer that absorbs vibration and high-velocity impacts through elastic deformation. Ideal for gaskets, tires, and shock-absorbing protective gear liners, though difficult to print on Bowden extruders.",
              "Nylon": "An incredibly durable engineering polymer with exceptional abrasion resistance and low surface friction. It yields ultra-tough, flexible mechanical components like gears, but is highly hygroscopic and warps heavily without proper drying.",
              "PC": "An ultra-strong, structurally rigid material providing the highest heat deflection and maximum impact resistance without shattering. It requires extreme printing temperatures and is the industry standard for high-stress protective shells.",
              "Not Printalble": "Anything that shouldnt be printed using a 3d printer. choose this if the required idea is not printable or the material you should use is not usable as a filament."
            }
          },
          "is_safe_to_print": {
            "type": "noul",
            "instructions": "is the provided idea safe to print? could there be bacteria or safety problems?",
            "criteria": {
              "true": "The provided idea is safe to print with the correct filament type. ",
              "false": "The provided idea is not safe to print, due to bacteria, health, safety or other problems"
            }
          },
        }
      })
    });

  type ApiResponse = {
    answers?: {
      filament_type: {
        choice: string;
      };
      is_safe_to_print: {
        noul: number;
      };
    };
  };

  const data_raw = await response.json();
  const data = data_raw as ApiResponse;

  if (data.answers) {
    return { filamentType: data.answers.filament_type.choice, safety: data.answers.is_safe_to_print.noul }
  } else {
    return { filamentType: `unknown`, safety: 0.5 }
  }
}

