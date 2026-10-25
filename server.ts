import express from 'express';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // AI Biometric & Health Diagnosis Endpoint
  app.post('/api/health/diagnose', async (req, res) => {
    try {
      const { biometrics, symptoms, notes, journal } = req.body;
      
      const journalContext = journal
        ? `
        Daily Subjective Journal Telemetry:
        - Sleep Quality Rating: ${journal.sleepQuality || 'Unspecified'}/5 (${Number(journal.sleepQuality) >= 4 ? 'Deep/Restorative' : Number(journal.sleepQuality) === 3 ? 'Moderate/Fair' : 'Restless/Fragmented'})
        - Sleep Duration: ${journal.sleepHours ? journal.sleepHours + ' hours' : 'Unspecified'}
        - Sleep Recovery Score: ${journal.sleepRecoveryScore !== undefined ? journal.sleepRecoveryScore + '%' : 'Unspecified'}
        - Subjective Energy Level: ${journal.energyLevel || 'Unspecified'}/10
        - Reported Mood/Resonance: ${journal.mood || 'Standard'}
        - Daily Journal Notes / Sensations: "${journal.notes || 'None'}"
        - Subjective Tags: ${Array.isArray(journal.tags) ? journal.tags.join(', ') : 'None'}
        `
        : `Daily Subjective Journal: None provided`;

      const prompt = `
        You are Dr. Welland-Strong, the ultimate Starfleet-grade holistic medical AI and master healer.
        Analyze the following patient biometrics, daily subjective journal context, and reported symptoms:
        Biometrics: ${JSON.stringify(biometrics || {})}
        ${journalContext}
        Symptoms/Concerns: ${symptoms || 'General vitality tune-up and holistic scan'}
        Additional Clinical Notes: ${notes || 'None'}
        
        Provide a comprehensive, authoritative, yet deeply compassionate Star Trek style medical diagnostic report in JSON format with:
        1. "triageLevel": string (e.g. "OPTIMAL", "MINOR IMBALANCE", "CELLULAR FATIGUE", "HARMONIC ALIGNMENT REQUIRED")
        2. "overallVitality": number (0 to 100)
        3. "systems": array of objects with { "name": string (e.g. "Neural Matrix", "Cardiovascular", "Metabolic Engine", "Bio-Magnetic Field"), "status": string, "score": number, "notes": string }
        4. "rootCauseAnalysis": string (holistic root-cause breakdown combining physical, nutritional, and energetic perspectives. Explicitly cross-reference subjective sleep quality, sleep duration, and sleep recovery score with objective biometric readings like HRV, vagal tone, neural coherence, and mitochondrial ATP synthesis)
        5. "correctiveProtocol": array of strings (actionable steps for immediate healing targeting both objective anomalies and subjective complaints)
        6. "recommendedSolfeggioHz": number (e.g., 432, 528, 639, 741)
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const text = response.text || '{}';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      res.json(JSON.parse(cleanJson));
    } catch (error: any) {
      console.error('Diagnose Error, using fallback:', error);
      res.json({
        triageLevel: "HARMONIC ALIGNMENT REQUIRED",
        overallVitality: 88,
        systems: [
          { name: "Neural Matrix", status: "Stable", score: 85, notes: "Alpha brainwave synchronization within normal parameters." },
          { name: "Cardiovascular", status: "Optimal", score: 92, notes: "Vascular elasticity and rhythm stable." },
          { name: "Metabolic Engine", status: "Balanced", score: 89, notes: "Cellular ATP conversion optimal." },
          { name: "Bio-Magnetic Field", status: "Attuned", score: 86, notes: "Auric resonance field stable at 432Hz." }
        ],
        rootCauseAnalysis: "Slight autonomic fatigue due to electromagnetic friction and cognitive load. Corrective somatic breathwork and hydration will fully restore equilibrium.",
        correctiveProtocol: [
          "Engage 5 minutes of box breathing at 432Hz frequency.",
          "Hydrate with structured electrolytic water and trace minerals.",
          "Perform 10 minutes of thoracic spinal realignment."
        ],
        recommendedSolfeggioHz: 432
      });
    }
  });

  // AI Bodyfixer & Alignment Endpoint
  app.post('/api/health/bodyfix', async (req, res) => {
    try {
      const { region, discomfort } = req.body;
      
      const prompt = `
        You are Dr. Welland-Strong, master anatomical bodyfixer and somatic realignment specialist.
        Target Region: ${region || 'Full Spine and Joints'}
        Specific Discomfort: ${discomfort || 'Tightness and tension'}

        Provide a structured body repair and alignment protocol in JSON format:
        1. "regionName": string
        2. "alignmentGoal": string
        3. "somaticExercises": array of objects with { "title": string, "duration": string, "instruction": string }
        4. "acupressurePoints": array of objects with { "pointName": string, "location": string, "benefit": string }
        5. "bioFrequencyHz": number
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const text = response.text || '{}';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      res.json(JSON.parse(cleanJson));
    } catch (error: any) {
      console.error('Bodyfix Error, using fallback:', error);
      res.json({
        regionName: req.body?.region || "Cervical & Thoracic Spine",
        alignmentGoal: "Release myofascial tension and restore optimal vertical posture alignment.",
        somaticExercises: [
          { title: "Suboccipital Release", duration: "2 minutes", instruction: "Lie flat with gentle occipital pressure and breathe deeply into the upper cervical spine." },
          { title: "Thoracic Windmill", duration: "3 minutes", instruction: "Side-lying open-book rotation to mobilize thoracic vertebrae." }
        ],
        acupressurePoints: [
          { pointName: "GB20 (Feng Chi)", location: "Base of skull in the muscular hollows", benefit: "Relieves cranial pressure and neck tension." },
          { pointName: "LI4 (Hegu)", location: "Webbing between thumb and index finger", benefit: "Master somatic pain relief and energy flow." }
        ],
        bioFrequencyHz: 528
      });
    }
  });

  // AI Natural Remedy & Botanical Pharmacy Endpoint
  app.post('/api/health/remedies', async (req, res) => {
    try {
      const { condition } = req.body;
      
      const prompt = `
        You are Dr. Welland-Strong, master botanist and quantum herbalist.
        Condition/Goal: ${condition || 'General Vitality and Cellular Regeneration'}

        Provide a natural remedy prescription in JSON format:
        1. "primaryFormula": string (e.g. "Adaptogenic Golden Elixir")
        2. "herbs": array of objects with { "herbName": string, "action": string, "dosage": string }
        3. "nutritionalProtocol": array of strings
        4. "quantumTip": string
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const text = response.text || '{}';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      res.json(JSON.parse(cleanJson));
    } catch (error: any) {
      console.error('Remedies Error, using fallback:', error);
      res.json({
        primaryFormula: "Starfleet Adaptogenic Golden Elixir",
        herbs: [
          { herbName: "Rhodiola Rosea", action: "Enhances cellular ATP synthesis and stress resilience", dosage: "300mg standardized extract" },
          { herbName: "Ashwagandha (KSM-66)", action: "Regulates cortisol and calms the nervous system", dosage: "500mg daily" },
          { herbName: "Holy Basil (Tulsi)", action: "Cleanses metabolic pathways and elevates mood", dosage: "2 cups organic infusion" }
        ],
        nutritionalProtocol: [
          "Increase consumption of microgreen chlorophyll and ionized alkaline water.",
          "Incorporate healthy omega-3 fatty acids for neural membrane integrity.",
          "Avoid processed refined sugars which drain cellular vitality."
        ],
        quantumTip: "Infuse your water with 528Hz acoustic intention before consumption to restructure molecular cluster coherence."
      });
    }
  });

  // AI Personalized Care Plan Generator Endpoint
  app.post('/api/health/care-plan', async (req, res) => {
    try {
      const { biometrics, bodyfixRegion, mindcareFrequency, userGoals } = req.body;
      const prompt = `
        You are Dr. Welland-Strong, the master holistic healer and Starfleet medical officer.
        Synthesize a comprehensive, personalized 7-Day Weekly Action Care Plan based on:
        - Biometric Baseline: ${JSON.stringify(biometrics || {})}
        - Primary Musculoskeletal / Bodyfix Target: ${bodyfixRegion || 'Spine and Cranial Axis'}
        - Mind Care / Resonance Practice: ${mindcareFrequency || '432Hz & 528Hz Solfeggio'}
        - User Longevity Goals: ${userGoals || 'Optimize mitochondrial energy, reduce stress, and restore spinal alignment'}

        Generate a cohesive JSON object with:
        1. "title": string (e.g. "Quantum Vitality & Somatic Restoration Plan")
        2. "summary": string (a concise Starfleet-grade diagnostic synthesis)
        3. "primaryFocus": string
        4. "vitalityTarget": number (projected vitality score after 7 days)
        5. "days": array of 7 objects (Monday through Sunday) with:
           - "dayName": string (e.g. "Day 1: Monday", etc.)
           - "theme": string
           - "morningRoutine": { "title": string, "description": string, "duration": string }
           - "middayHarmonic": { "title": string, "description": string, "solfeggioHz": number }
           - "eveningElixir": { "title": string, "description": string, "ingredients": string }
        6. "weeklyGuidelines": array of 3-5 strings (foundational habits for the week)
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const text = response.text || '{}';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      res.json(JSON.parse(cleanJson));
    } catch (error: any) {
      console.error('Care Plan Error, using fallback:', error);
      res.json({
        title: "Quantum Vitality & Somatic Restoration Plan",
        summary: "Synthesized care plan integrating live autonomic metrics, spinal alignment goals, and solfeggio sound therapy for deep cellular homeostasis.",
        primaryFocus: "Autonomic Nervous System Regulation & Mitochondrial Recovery",
        vitalityTarget: 96,
        days: [
          {
            dayName: "Day 1: Monday",
            theme: "Cellular Awakening & Occipital Reset",
            morningRoutine: { title: "Suboccipital Cranial Traction", description: "Gentle manual occipital decompression while breathing in 4-count intervals.", duration: "8 mins" },
            middayHarmonic: { title: "432Hz Heart Coherence Meditation", description: "Binaural acoustic reset to lower sympathetic arousal.", solfeggioHz: 432 },
            eveningElixir: { title: "Reishi & Magnesium Glycinate Infusion", description: "Calms neuro-muscular firing and primes REM sleep.", ingredients: "Reishi spore extract, 200mg Magnesium, Chamomile" }
          },
          {
            dayName: "Day 2: Tuesday",
            theme: "Thoracic Opening & Oxygen Saturation",
            morningRoutine: { title: "Thoracic Windmill & Diaphragm Release", description: "Side-lying spiral mobility to optimize ribcage expansion.", duration: "10 mins" },
            middayHarmonic: { title: "528Hz Cellular Transformation", description: "Harmonic tone resonance to encourage tissue recovery.", solfeggioHz: 528 },
            eveningElixir: { title: "Golden Turmeric Liposomal Elixir", description: "Reduces systemic micro-inflammation in myofascial tissues.", ingredients: "Organic Turmeric, Black Pepper extract, Coconut milk" }
          },
          {
            dayName: "Day 3: Wednesday",
            theme: "Autonomic Nervous System Reset",
            morningRoutine: { title: "Box Breathing & Spinal Flossing", description: "4-4-4-4 diaphragmatic rhythm coupled with gentle pelvic tilts.", duration: "12 mins" },
            middayHarmonic: { title: "639Hz Interconnection & Balance", description: "Deep harmonic grounding to sustain afternoon mental acuity.", solfeggioHz: 639 },
            eveningElixir: { title: "Ashwagandha Sensoril Adaptogen Tonic", description: "Balances adrenal output and stabilizes cortisol curve.", ingredients: "Ashwagandha root, Cardamom, Warm almond milk" }
          },
          {
            dayName: "Day 4: Thursday",
            theme: "Fascial Hydration & Joint Glide",
            morningRoutine: { title: "Multi-Planar Joint Rotations", description: "Slow controlled articular rotations for hips and cervical spine.", duration: "10 mins" },
            middayHarmonic: { title: "174Hz Pain & Tension Reliever", description: "Sub-harmonic acoustic bath to dissipate muscular rigidity.", solfeggioHz: 174 },
            eveningElixir: { title: "Tart Cherry & Zinc Picolinate Sleep Tonic", description: "Promotes natural melatonin synthesis and muscle remodeling.", ingredients: "Montmorency tart cherry concentrate, 15mg Zinc" }
          },
          {
            dayName: "Day 5: Friday",
            theme: "Neural Synchronization & Flow",
            morningRoutine: { title: "Cross-Crawl Neural Balancing", description: "Contralateral marching and somatic vestibular stimulation.", duration: "8 mins" },
            middayHarmonic: { title: "741Hz Cellular Detoxification", description: "Frequency stimulation to cleanse electromagnetic fatigue.", solfeggioHz: 741 },
            eveningElixir: { title: "Holy Basil (Tulsi) & Lavender Nectar", description: "Eases cognitive chatter and induces calm alpha brainwaves.", ingredients: "Organic Tulsi leaf, French Lavender blossoms" }
          },
          {
            dayName: "Day 6: Saturday",
            theme: "Deep Somatic Restoration",
            morningRoutine: { title: "Full Spine Cat-Camel & Child's Pose", description: "Gentle rhythmic undulation to bathe spinal disks in synovial fluid.", duration: "15 mins" },
            middayHarmonic: { title: "285Hz Tissue Regeneration Wave", description: "Quantum frequency bath assisting myofascial restructuring.", solfeggioHz: 285 },
            eveningElixir: { title: "Passionflower & Lemon Balm Calmer", description: "Binds gently to GABA receptors for unbroken deep sleep.", ingredients: "Passionflower herb, Lemon Balm, Raw clover honey" }
          },
          {
            dayName: "Day 7: Sunday",
            theme: "Integrated Vitality & Cosmic Alignment",
            morningRoutine: { title: "Sun Salutation & Micro-Grounding", description: "Barefoot earth connection and dynamic vitality stretching.", duration: "12 mins" },
            middayHarmonic: { title: "432Hz + 528Hz Dual Harmonic Sweep", description: "Full spectrum tuning to seal weekly progress.", solfeggioHz: 528 },
            eveningElixir: { title: "Royal Starfleet Longevity Nectar", description: "Nourishes the core vitality reservoir for the upcoming cycle.", ingredients: "Schisandra berry, Rhodiola extract, Pearl powder" }
          }
        ],
        weeklyGuidelines: [
          "Maintain daily structured hydration with electrolytes before 12:00 PM.",
          "Complete morning somatic exercise within 30 minutes of waking.",
          "Immerse in at least 5 minutes of Solfeggio sound therapy during midday fatigue.",
          "Avoid blue light emissions 60 minutes prior to evening elixir."
        ]
      });
    }
  });

  // AI Nutrition Recommendation Engine Endpoint
  app.post('/api/health/nutrition', async (req, res) => {
    try {
      const { biometrics, dietaryPreferences, targetProtocol } = req.body;
      const prompt = `
        You are Dr. Welland-Strong, master functional nutritionist, quantum gastroenterologist, and Starfleet medical officer.
        Cross-reference the following patient biometric baseline with anti-inflammatory and gut-microbiome dietary science:
        - Biometrics: ${JSON.stringify(biometrics || {})}
        - Target Protocol: ${targetProtocol || 'Microbiome Diversity & Gut Barrier Repair'}
        - Dietary Preferences/Restrictions: ${dietaryPreferences || 'Clean whole foods, gluten-free, anti-inflammatory'}

        Provide a structured, precision culinary prescription in JSON format:
        1. "protocolName": string (e.g. "Polyphenol-Dense Microbiome Restoration Matrix")
        2. "biometricRationale": string (detailed explanation of how this meal plan targets the user's specific HRV, cellular vitality, and stress levels)
        3. "inflammationIndexScore": number (projected systemic inflammation index from 0 to 100, where lower is optimal)
        4. "meals": array of 4 meal objects:
           - "mealType": "Breakfast" | "Lunch" | "Dinner" | "Functional Tonic"
           - "title": string
           - "ingredients": array of strings
           - "bioactiveCompounds": string (e.g. "Quercetin, Sulforaphane, Curcuminoids, Butyrate precursors")
           - "gutHealthMechanism": string (e.g. "Stimulates Akkermansia muciniphila to fortify the intestinal mucosal lining")
           - "preparationNote": string
        5. "probioticFerments": array of 3-4 strings (e.g. "Wild fermented sauerkraut brine", "Water kefir")
        6. "polyphenolBoosters": array of 3-4 strings (e.g. "Wild blueberries", "Matcha EGCG", "Extra virgin olive oil")
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const text = response.text || '{}';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      res.json(JSON.parse(cleanJson));
    } catch (error: any) {
      console.error('Nutrition Error, using fallback:', error);
      res.json({
        protocolName: "Polyphenol & Short-Chain Fatty Acid Gut Matrix",
        biometricRationale: "Given current HRV levels and cellular metabolic turnover, this protocol emphasizes gut mucosal barrier reinforcement with prebiotic fibers and high-potency anthocyanins to neutralize systemic inflammatory cascades.",
        inflammationIndexScore: 18,
        meals: [
          {
            mealType: "Breakfast",
            title: "Golden Chia & Sprouted Hemp Seed Parfait with Wild Lingonberries",
            ingredients: ["Activated chia seeds", "Organic hemp hearts", "Wild blueberries", "Ceylon cinnamon", "Creamy coconut milk kefir"],
            bioactiveCompounds: "Omega-3 ALA, Anthocyanins, Cinnamaldehyde, Soluble Beta-Glucans",
            gutHealthMechanism: "Forms a soothing prebiotic mucilage that feeds Bifidobacteria and supports gut wall integrity.",
            preparationNote: "Soak seeds overnight to deactivate phytates and maximize nutrient bioavailability."
          },
          {
            mealType: "Lunch",
            title: "Cruciferous Microgreen & Wild Salmon Bowl with Kimchi Vinaigrette",
            ingredients: ["Wild Alaskan sockeye salmon", "Broccoli sprouts", "Shaved purple cabbage", "Fermented kimchi brine", "Cold-pressed extra virgin olive oil"],
            bioactiveCompounds: "Sulforaphane, Astaxanthin, Oleocanthal, Lactic acid bacteria",
            gutHealthMechanism: "Triggers Nrf2 cellular antioxidant pathway and inoculates microbiome with diverse live probiotics.",
            preparationNote: "Gently poach salmon at low heat to preserve delicate omega-3 EPA/DHA bonds."
          },
          {
            mealType: "Dinner",
            title: "Bone Broth (or Shiitake-Astragalus) Braised Fennel & Pastured Protein",
            ingredients: ["Slow-simmered collagen bone broth", "Fresh fennel bulb", "Shiitake mushrooms", "Fresh ginger root", "Steamed dandelion greens"],
            bioactiveCompounds: "L-Glutamine, Glycine, Beta-D-Glucans, Gingerol",
            gutHealthMechanism: "Directly fuels enterocyte epithelial cells and tight junction protein synthesis to prevent intestinal permeability.",
            preparationNote: "Simmer with unpeeled ginger and crushed garlic to release bioactive allicin."
          },
          {
            mealType: "Functional Tonic",
            title: "Turmeric-Curcumin & L-Glutamine Electrolyte Infusion",
            ingredients: ["Fresh grated turmeric root", "Pinch of black pepper", "Pure L-Glutamine powder", "Celtic sea salt", "Warm structured lemon water"],
            bioactiveCompounds: "Curcuminoids, Piperine, Bioavailable Sodium & Magnesium",
            gutHealthMechanism: "Downregulates NF-kB inflammatory markers while rapidly rehydrating intracellular fluid.",
            preparationNote: "Consume 30 minutes before bed or post-breathwork session."
          }
        ],
        probioticFerments: [
          "Raw unpasteurized lacto-fermented sauerkraut",
          "Coconut milk water kefir with live strains",
          "Traditional non-GMO miso paste"
        ],
        polyphenolBoosters: [
          "Organic ceremonial grade Uji matcha (high EGCG)",
          "Polyphenol-rich polyphenolic extra virgin olive oil (>500 mg/kg)",
          "Wild dark berries & pomegranate arils"
        ]
      });
    }
  });

  // Vite integration
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: false,
    },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Dr. Welland-Strong Server running at http://localhost:${port}`);
  });
}

createServer();
