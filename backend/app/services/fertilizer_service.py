import logging
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime

from app.schemas.fertilizer import (
    FertilizerCalculateRequest,
    FertilizerCalculateResponse,
    NutrientRequirement,
    CommercialFertilizer,
    OrganicRecommendation,
    ApplicationSchedule,
    SaveFertilizerPlanRequest,
    FertilizerPlanRecord
)
from app.core.db import prisma_client

logger = logging.getLogger(__name__)

# Standard Subsidized MRP Prices in India (₹ per bag / kg / tonne)
PRICES = {
    "urea_bag_45kg": 266.50,
    "dap_bag_50kg": 1350.00,
    "mop_bag_50kg": 1700.00,
    "vermicompost_per_kg": 8.00,
    "fym_per_tonne": 1200.00,
    "neem_cake_per_kg": 25.00
}

# Land area conversion factors to Acres
AREA_CONVERSIONS = {
    "acres": 1.0,
    "acre": 1.0,
    "guntas": 0.025,       # 1 Acre = 40 Guntas
    "gunta": 0.025,
    "bighas": 0.625,       # 1 Acre = 1.6 Bighas (standard)
    "bigha": 0.625,
    "hectares": 2.471,     # 1 Hectare = 2.471 Acres
    "hectare": 2.471
}

# State Agricultural University / ICAR Package of Practices (POP) per Acre
CROP_POP_CATALOG: Dict[str, Dict[str, Any]] = {
    "tomato": {
        "display_name": "Tomato (Hybrid)",
        "pure_n_per_acre": 50.0,
        "pure_p_per_acre": 32.0,
        "pure_k_per_acre": 40.0,
        "fym_tons_per_acre": 8.0,
        "vermicompost_kg_per_acre": 1000.0,
        "neem_cake_kg_per_acre": 150.0,
        "biofertilizers": ["Azotobacter (2 kg/acre)", "Phosphate Solubilizing Bacteria (PSB 2 kg/acre)", "Trichoderma viride"],
        "organic_benefits": "Enriches soil microbial diversity, prevents bacterial wilt, and improves fruit firmness and brix sweetness.",
        "schedules": [
            {
                "stage_name": "Basal / Field Preparation",
                "timing": "Before transplanting / At bed preparation",
                "urea_split_percent": 25,
                "dap_split_percent": 100,
                "mop_split_percent": 30,
                "instructions": "Incorporate full DAP with decomposed FYM and neem cake into planting ridges."
            },
            {
                "stage_name": "Vegetative / Early Growth",
                "timing": "20–25 Days After Transplanting (DAT)",
                "urea_split_percent": 40,
                "dap_split_percent": 0,
                "mop_split_percent": 30,
                "instructions": "Side dress Urea and MOP 10 cm away from plant crown. Irrigate immediately."
            },
            {
                "stage_name": "Flowering & Fruit Development",
                "timing": "45–55 Days After Transplanting (DAT)",
                "urea_split_percent": 35,
                "dap_split_percent": 0,
                "mop_split_percent": 40,
                "instructions": "Apply potassium-rich split to prevent blossom end rot and maximize fruit size."
            }
        ],
        "safety_tips": [
            "Never broadcast Urea on wet leaf canopy to avoid leaf scorch.",
            "Maintain calcium levels via gypsum or foliar spray to prevent blossom end rot (BER).",
            "In drip-irrigated plots, fertigate in 3-day intervals for 35% higher nutrient efficiency."
        ]
    },
    "rice": {
        "display_name": "Paddy / Rice (High Yielding)",
        "pure_n_per_acre": 40.0,
        "pure_p_per_acre": 20.0,
        "pure_k_per_acre": 20.0,
        "fym_tons_per_acre": 5.0,
        "vermicompost_kg_per_acre": 800.0,
        "neem_cake_kg_per_acre": 100.0,
        "biofertilizers": ["Azospirillum (2 kg/acre)", "Blue Green Algae (BGA)", "Phosphobacteria"],
        "organic_benefits": "Builds humus layer in puddled soils and reduces methane generation while accelerating root tillering.",
        "schedules": [
            {
                "stage_name": "Basal (Last Puddling)",
                "timing": "Just before transplanting seedlings",
                "urea_split_percent": 33,
                "dap_split_percent": 100,
                "mop_split_percent": 50,
                "instructions": "Mix into muddy soil during final leveling. Ensures deep root establishment."
            },
            {
                "stage_name": "Active Tillering",
                "timing": "20–25 Days After Transplanting",
                "urea_split_percent": 33,
                "dap_split_percent": 0,
                "mop_split_percent": 0,
                "instructions": "Broadcast Urea mixed with dry sand when standing water depth is 2–3 cm."
            },
            {
                "stage_name": "Panicle Initiation (PI)",
                "timing": "40–45 Days After Transplanting",
                "urea_split_percent": 34,
                "dap_split_percent": 0,
                "mop_split_percent": 50,
                "instructions": "Crucial top-dressing for grain filling and preventing empty spikelets (chaffy grain)."
            }
        ],
        "safety_tips": [
            "Drain excess water before broadcasting Urea and re-flood after 24–48 hours for maximum uptake.",
            "Apply Zinc Sulphate (10 kg/acre) separately from DAP to avoid zinc phosphate precipitation."
        ]
    },
    "wheat": {
        "display_name": "Wheat (Sharbati / Timely Sown)",
        "pure_n_per_acre": 48.0,
        "pure_p_per_acre": 24.0,
        "pure_k_per_acre": 16.0,
        "fym_tons_per_acre": 5.0,
        "vermicompost_kg_per_acre": 750.0,
        "neem_cake_kg_per_acre": 80.0,
        "biofertilizers": ["Azotobacter", "Phosphate Solubilizing Bacteria (PSB)"],
        "organic_benefits": "Improves water holding capacity and soil structure in loamy plains.",
        "schedules": [
            {
                "stage_name": "Basal Sowing",
                "timing": "At seed drilling",
                "urea_split_percent": 33,
                "dap_split_percent": 100,
                "mop_split_percent": 100,
                "instructions": "Drill DAP and Potash 5 cm below seed level using ferti-seed drill."
            },
            {
                "stage_name": "Crown Root Initiation (CRI)",
                "timing": "21–25 Days After Sowing (1st Irrigation)",
                "urea_split_percent": 33,
                "dap_split_percent": 0,
                "mop_split_percent": 0,
                "instructions": "Broadcast top-dress Urea immediately before or after first irrigation."
            },
            {
                "stage_name": "Jointing / Boot Stage",
                "timing": "45–50 Days After Sowing (2nd Irrigation)",
                "urea_split_percent": 34,
                "dap_split_percent": 0,
                "mop_split_percent": 0,
                "instructions": "Final nitrogen dose to increase protein content and earhead length."
            }
        ],
        "safety_tips": [
            "Ensure the 1st irrigation at CRI stage is never delayed, as nodal root development determines grain count."
        ]
    },
    "cotton": {
        "display_name": "Cotton (Bt Hybrid)",
        "pure_n_per_acre": 48.0,
        "pure_p_per_acre": 24.0,
        "pure_k_per_acre": 24.0,
        "fym_tons_per_acre": 6.0,
        "vermicompost_kg_per_acre": 1000.0,
        "neem_cake_kg_per_acre": 150.0,
        "biofertilizers": ["Azospirillum", "Potash Mobilizing Bacteria (KMB)"],
        "organic_benefits": "Improves deep tap root penetration and reduces shedding of squares and flower buds.",
        "schedules": [
            {
                "stage_name": "Basal Placement",
                "timing": "At sowing / dibbling",
                "urea_split_percent": 20,
                "dap_split_percent": 100,
                "mop_split_percent": 25,
                "instructions": "Place basal dose in band 7-10 cm away from seed row."
            },
            {
                "stage_name": "Square Formation",
                "timing": "35–40 Days After Sowing",
                "urea_split_percent": 40,
                "dap_split_percent": 0,
                "mop_split_percent": 35,
                "instructions": "Top-dress alongside weeding and earthing up operations."
            },
            {
                "stage_name": "Peak Boll Development",
                "timing": "60–75 Days After Sowing",
                "urea_split_percent": 40,
                "dap_split_percent": 0,
                "mop_split_percent": 40,
                "instructions": "Critical potassium application to ensure maximum boll weight and staple strength."
            }
        ],
        "safety_tips": [
            "Spray Magnesium Sulphate (1%) and 19:19:19 (1%) at peak boll opening to prevent leaf reddening."
        ]
    },
    "maize": {
        "display_name": "Maize (Hybrid Grain)",
        "pure_n_per_acre": 48.0,
        "pure_p_per_acre": 24.0,
        "pure_k_per_acre": 16.0,
        "fym_tons_per_acre": 5.0,
        "vermicompost_kg_per_acre": 800.0,
        "neem_cake_kg_per_acre": 100.0,
        "biofertilizers": ["Azotobacter", "VAM (Mycorrhiza)"],
        "organic_benefits": "Enhances phosphorus uptake via mycorrhizal hyphae and improves drought tolerance.",
        "schedules": [
            {
                "stage_name": "Basal Application",
                "timing": "At seed sowing",
                "urea_split_percent": 25,
                "dap_split_percent": 100,
                "mop_split_percent": 100,
                "instructions": "Apply DAP and MOP in furrows 5 cm below seed depth."
            },
            {
                "stage_name": "Knee-High Stage",
                "timing": "30–35 Days After Sowing",
                "urea_split_percent": 40,
                "dap_split_percent": 0,
                "mop_split_percent": 0,
                "instructions": "Band placement followed by earthing up to prevent plant lodging."
            },
            {
                "stage_name": "Tasseling & Silking",
                "timing": "50–55 Days After Sowing",
                "urea_split_percent": 35,
                "dap_split_percent": 0,
                "mop_split_percent": 0,
                "instructions": "Top-dress during moist soil condition to boost cob length and grain fill."
            }
        ],
        "safety_tips": [
            "Avoid moisture stress during tasseling; nutrient absorption drops drastically if soil is dry."
        ]
    },
    "potato": {
        "display_name": "Potato (Commercial Tuber)",
        "pure_n_per_acre": 60.0,
        "pure_p_per_acre": 40.0,
        "pure_k_per_acre": 48.0,
        "fym_tons_per_acre": 10.0,
        "vermicompost_kg_per_acre": 1200.0,
        "neem_cake_kg_per_acre": 200.0,
        "biofertilizers": ["Azotobacter", "Phosphobacteria"],
        "organic_benefits": "Essential for loose, friable soil structure to allow maximum uniform tuber bulking.",
        "schedules": [
            {
                "stage_name": "Basal (Planting Furrow)",
                "timing": "At tuber planting",
                "urea_split_percent": 50,
                "dap_split_percent": 100,
                "mop_split_percent": 50,
                "instructions": "Place fertilizer in bands on both sides of seed tubers and cover with soil."
            },
            {
                "stage_name": "Earthing-Up / Tuber Initiation",
                "timing": "30–35 Days After Planting",
                "urea_split_percent": 50,
                "dap_split_percent": 0,
                "mop_split_percent": 50,
                "instructions": "Side-dress remaining Urea and Potash before earthing up ridges."
            }
        ],
        "safety_tips": [
            "Use SOP (Sulphate of Potash) instead of MOP if available to boost tuber dry matter and starch content."
        ]
    },
    "chilli": {
        "display_name": "Chilli (Red / Green)",
        "pure_n_per_acre": 48.0,
        "pure_p_per_acre": 24.0,
        "pure_k_per_acre": 24.0,
        "fym_tons_per_acre": 8.0,
        "vermicompost_kg_per_acre": 1000.0,
        "neem_cake_kg_per_acre": 150.0,
        "biofertilizers": ["Azospirillum", "PSB"],
        "organic_benefits": "Prevents damping-off and root rot, while enhancing pungency and capsanthin color value.",
        "schedules": [
            {
                "stage_name": "Basal",
                "timing": "Field prep",
                "urea_split_percent": 30,
                "dap_split_percent": 100,
                "mop_split_percent": 40,
                "instructions": "Incorporate basal dose into main beds."
            },
            {
                "stage_name": "First Flush Flowering",
                "timing": "30–35 DAT",
                "urea_split_percent": 35,
                "dap_split_percent": 0,
                "mop_split_percent": 30,
                "instructions": "Top-dress to encourage multi-branching."
            },
            {
                "stage_name": "Fruiting & Harvesting Cycle",
                "timing": "60–70 DAT",
                "urea_split_percent": 35,
                "dap_split_percent": 0,
                "mop_split_percent": 30,
                "instructions": "Post 1st picking replenishment to sustain continuous flushes."
            }
        ],
        "safety_tips": [
            "Avoid high nitrogen at late flowering to prevent excessive vegetative growth and flower drop."
        ]
    },
    "soybean": {
        "display_name": "Soybean (Oilseed Legume)",
        "pure_n_per_acre": 12.0,  # Legume nodulation fixes air N
        "pure_p_per_acre": 24.0,
        "pure_k_per_acre": 16.0,
        "fym_tons_per_acre": 4.0,
        "vermicompost_kg_per_acre": 600.0,
        "neem_cake_kg_per_acre": 80.0,
        "biofertilizers": ["Bradyrhizobium japonicum (Seed treat)", "PSB"],
        "organic_benefits": "Inoculating with Rhizobium generates up to 60 kg atmospheric nitrogen for free.",
        "schedules": [
            {
                "stage_name": "Basal Sowing",
                "timing": "At sowing",
                "urea_split_percent": 100,
                "dap_split_percent": 100,
                "mop_split_percent": 100,
                "instructions": "Apply complete dose at sowing as starter nitrogen. Root nodules handle later N needs."
            }
        ],
        "safety_tips": [
            "Inoculate seeds with Rhizobium culture before sowing; dry in shade for 30 minutes before drilling."
        ]
    },
    "groundnut": {
        "display_name": "Groundnut / Peanut",
        "pure_n_per_acre": 10.0,
        "pure_p_per_acre": 20.0,
        "pure_k_per_acre": 16.0,
        "fym_tons_per_acre": 5.0,
        "vermicompost_kg_per_acre": 600.0,
        "neem_cake_kg_per_acre": 100.0,
        "biofertilizers": ["Rhizobium", "Phosphobacteria"],
        "organic_benefits": "Promotes root nodulation and increases oil synthesis percentage in kernels.",
        "schedules": [
            {
                "stage_name": "Basal",
                "timing": "At sowing",
                "urea_split_percent": 100,
                "dap_split_percent": 100,
                "mop_split_percent": 100,
                "instructions": "Apply complete NPK dose before sowing."
            },
            {
                "stage_name": "Pegging Stage (Gypsum)",
                "timing": "40–45 Days After Sowing",
                "urea_split_percent": 0,
                "dap_split_percent": 0,
                "mop_split_percent": 0,
                "instructions": "Broadcast Gypsum (200 kg/acre) close to plant base. Calcium is vital for pod shell filling and preventing hollow pods ('pops')."
            }
        ],
        "safety_tips": [
            "Apply Gypsum at 40-45 DAS without disturbing pegs entering the soil."
        ]
    }
}

class FertilizerService:
    def _normalize_to_acres(self, area: float, unit: str) -> float:
        clean_unit = unit.strip().lower()
        multiplier = AREA_CONVERSIONS.get(clean_unit, 1.0)
        return max(0.01, round(area * multiplier, 3))

    def _resolve_crop_profile(self, crop_input: str) -> Tuple[str, Dict[str, Any]]:
        c_lower = crop_input.strip().lower()
        for key, profile in CROP_POP_CATALOG.items():
            if key in c_lower or profile["display_name"].lower() in c_lower:
                return key, profile
            
        # Common aliases
        if "paddy" in c_lower or "dhan" in c_lower:
            return "rice", CROP_POP_CATALOG["rice"]
        if "corn" in c_lower or "makka" in c_lower:
            return "maize", CROP_POP_CATALOG["maize"]
        if "peanut" in c_lower:
            return "groundnut", CROP_POP_CATALOG["groundnut"]

        # Default fallback to Tomato
        return "tomato", CROP_POP_CATALOG["tomato"]

    def calculate_dosage(self, request: FertilizerCalculateRequest) -> FertilizerCalculateResponse:
        """
        Executes instant, high-precision agronomic NPK and commercial bag calculation.
        """
        crop_key, profile = self._resolve_crop_profile(request.crop_name)
        acres = self._normalize_to_acres(request.land_area, request.area_unit)

        # Stage scaling factor
        stage_factor = 1.0
        stage_lower = request.growth_stage.lower()
        if "basal" in stage_lower:
            stage_factor = 0.40
        elif "vegetative" in stage_lower or "tillering" in stage_lower:
            stage_factor = 0.35
        elif "flowering" in stage_lower or "pre-bloom" in stage_lower:
            stage_factor = 0.25
        elif "fruiting" in stage_lower or "grain" in stage_lower:
            stage_factor = 0.25

        # 1. Total pure nutrients needed for the acreage & stage
        pure_n = round(profile["pure_n_per_acre"] * acres * stage_factor, 1)
        pure_p = round(profile["pure_p_per_acre"] * acres * stage_factor, 1)
        pure_k = round(profile["pure_k_per_acre"] * acres * stage_factor, 1)

        # 2. Commercial Fertilizer Conversion
        # DAP (18:46:0) supplies all required Phosphorus (P2O5)
        dap_kg = round(pure_p / 0.46, 1)
        dap_bags = round(dap_kg / 50.0, 1)
        # N supplied by DAP (18% of DAP weight)
        n_from_dap = round(dap_kg * 0.18, 1)

        # Remaining Nitrogen supplied by Urea (46% N)
        remaining_n = max(0.0, pure_n - n_from_dap)
        urea_kg = round(remaining_n / 0.46, 1)
        urea_bags = round(urea_kg / 45.0, 1)

        # MOP (60% K2O) supplies Potash
        mop_kg = round(pure_k / 0.60, 1)
        mop_bags = round(mop_kg / 50.0, 1)

        # Costs
        urea_cost = round(urea_bags * PRICES["urea_bag_45kg"], 1)
        dap_cost = round(dap_bags * PRICES["dap_bag_50kg"], 1)
        mop_cost = round(mop_bags * PRICES["mop_bag_50kg"], 1)
        total_commercial_cost = round(urea_cost + dap_cost + mop_cost, 1)

        commercial_list = [
            CommercialFertilizer(
                name="Urea (46% N)",
                bag_weight_kg=45.0,
                bags_required=urea_bags,
                total_kg=urea_kg,
                price_per_bag=PRICES["urea_bag_45kg"],
                total_cost=urea_cost
            ),
            CommercialFertilizer(
                name="DAP (Di-Ammonium Phosphate 18:46:0)",
                bag_weight_kg=50.0,
                bags_required=dap_bags,
                total_kg=dap_kg,
                price_per_bag=PRICES["dap_bag_50kg"],
                total_cost=dap_cost
            ),
            CommercialFertilizer(
                name="MOP (Muriate of Potash 60% K2O)",
                bag_weight_kg=50.0,
                bags_required=mop_bags,
                total_kg=mop_kg,
                price_per_bag=PRICES["mop_bag_50kg"],
                total_cost=mop_cost
            )
        ]

        # 3. Organic & Bio-Fertilizer Package
        fym_tons = round(profile["fym_tons_per_acre"] * acres, 1)
        vermicompost_kg = round(profile["vermicompost_kg_per_acre"] * acres, 0)
        neem_cake_kg = round(profile["neem_cake_kg_per_acre"] * acres, 0)

        organic_rec = OrganicRecommendation(
            farmyard_manure_tons=fym_tons,
            vermicompost_kg=vermicompost_kg,
            neem_cake_kg=neem_cake_kg,
            biofertilizers=profile["biofertilizers"],
            benefits=profile["organic_benefits"]
        )

        # 4. Stage schedules
        schedules = [
            ApplicationSchedule(**s) for s in profile["schedules"]
        ]

        return FertilizerCalculateResponse(
            crop_name=profile["display_name"],
            land_area=request.land_area,
            area_unit=request.area_unit,
            normalized_acres=acres,
            growth_stage=request.growth_stage,
            nutrients=NutrientRequirement(
                nitrogen_kg=pure_n,
                phosphorus_kg=pure_p,
                potassium_kg=pure_k
            ),
            commercial_fertilizers=commercial_list,
            organic_alternatives=organic_rec,
            schedules=schedules,
            total_estimated_cost=total_commercial_cost,
            safety_tips=profile["safety_tips"]
        )

    async def save_plan(self, req: SaveFertilizerPlanRequest) -> FertilizerPlanRecord:
        """
        Persists a customized fertilizer plan in PostgreSQL via Prisma.
        """
        if not prisma_client.is_connected():
            await prisma_client.connect()

        saved = await prisma_client.fertilizerplan.create(
            data={
                "crop_name": req.crop_name,
                "land_area": req.land_area,
                "area_unit": req.area_unit,
                "growth_stage": req.growth_stage,
                "nitrogen_kg": req.nitrogen_kg,
                "phosphorus_kg": req.phosphorus_kg,
                "potassium_kg": req.potassium_kg,
                "urea_bags": req.urea_bags,
                "dap_bags": req.dap_bags,
                "mop_bags": req.mop_bags,
                "fym_tons": req.fym_tons,
                "vermicompost_kg": req.vermicompost_kg,
                "estimated_cost": req.estimated_cost
            }
        )

        return FertilizerPlanRecord(
            id=saved.id,
            crop_name=saved.crop_name,
            land_area=saved.land_area,
            area_unit=saved.area_unit,
            growth_stage=saved.growth_stage,
            nitrogen_kg=saved.nitrogen_kg,
            phosphorus_kg=saved.phosphorus_kg,
            potassium_kg=saved.potassium_kg,
            urea_bags=saved.urea_bags,
            dap_bags=saved.dap_bags,
            mop_bags=saved.mop_bags,
            fym_tons=saved.fym_tons,
            vermicompost_kg=saved.vermicompost_kg,
            estimated_cost=saved.estimated_cost,
            created_at=saved.created_at.strftime("%Y-%m-%d %H:%M")
        )

    async def get_saved_plans(self, limit: int = 10) -> List[FertilizerPlanRecord]:
        """
        Retrieves recent saved fertilizer plans from PostgreSQL.
        """
        if not prisma_client.is_connected():
            await prisma_client.connect()

        plans = await prisma_client.fertilizerplan.find_many(
            take=limit,
            order={"created_at": "desc"}
        )

        return [
            FertilizerPlanRecord(
                id=p.id,
                crop_name=p.crop_name,
                land_area=p.land_area,
                area_unit=p.area_unit,
                growth_stage=p.growth_stage,
                nitrogen_kg=p.nitrogen_kg,
                phosphorus_kg=p.phosphorus_kg,
                potassium_kg=p.potassium_kg,
                urea_bags=p.urea_bags,
                dap_bags=p.dap_bags,
                mop_bags=p.mop_bags,
                fym_tons=p.fym_tons,
                vermicompost_kg=p.vermicompost_kg,
                estimated_cost=p.estimated_cost,
                created_at=p.created_at.strftime("%Y-%m-%d %H:%M")
            )
            for p in plans
        ]

fertilizer_service = FertilizerService()
