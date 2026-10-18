import logging
from typing import List, Optional
from app.core.db import prisma_client
from app.schemas.scheme import (
    SchemeOut,
    EligibilityCheckRequest,
    EligibilityCheckResponse,
    SchemeMatchResult,
    SaveSchemeRequest,
    SavedSchemeResponse
)

logger = logging.getLogger(__name__)

DEFAULT_SCHEMES_DATA = [
    {
        "code": "PM_KISAN",
        "name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        "short_name": "PM-KISAN Income Support",
        "category": "Direct Income Support",
        "implementing_agency": "Ministry of Agriculture & Farmers Welfare, Government of India",
        "benefit_summary": "₹6,000 per year directly transferred to your bank account in 3 equal installments of ₹2,000 every 4 months (April-July, August-November, December-March).",
        "financial_benefit_max": 6000.0,
        "subsidy_percentage": 100.0,
        "target_crops": ["ALL"],
        "min_land_acres": 0.01,
        "max_land_acres": 100.0,
        "farmer_categories": ["Marginal (<2.5 acres)", "Small (2.5-5 acres)", "Medium / Large (>5 acres)"],
        "state_applicability": ["All-India"],
        "description": "Central Sector Direct Benefit Transfer (DBT) scheme designed to supplement agricultural input costs and protect smallholder farmers from informal moneylenders.",
        "key_eligibility": [
            "All landholder farmer families with cultivable landholding in their name",
            "Aadhaar-seeded bank account with active Direct Benefit Transfer (DBT) linkage",
            "Family members must not be institutional landholders, income tax assessees, or serving government officials"
        ],
        "required_documents": [
            "Aadhaar Card",
            "Land Record (RTC / Pahani / 7/12 Extract / Khatauni)",
            "Active Bank Passbook with IFSC Code",
            "Mobile Number linked with Aadhaar OTP"
        ],
        "application_steps": [
            "Visit the official portal at pmkisan.gov.in or your nearest Village CSC Kendra",
            "Select 'New Farmer Registration' and authenticate your 12-digit Aadhaar number",
            "Enter land survey number, khata number, and upload scanned land ownership RTC",
            "Complete mandatory e-KYC via facial recognition or Aadhaar OTP to activate installment flow"
        ],
        "official_portal_url": "https://pmkisan.gov.in",
        "helpline_number": "155261 / 011-24300606"
    },
    {
        "code": "PM_SINCHAYEE_PDMC",
        "name": "Pradhan Mantri Krishi Sinchayee Yojana (Per Drop More Crop - Drip & Sprinkler)",
        "short_name": "PMKSY Drip & Micro-Irrigation Subsidy",
        "category": "Irrigation & Water Conservation",
        "implementing_agency": "Department of Agriculture & Farmers Welfare, GoI & State Horticulture Departments",
        "benefit_summary": "55% financial capital subsidy for Small & Marginal farmers (up to 5 acres); 45% subsidy for other farmers on Drip, Micro-Sprinkler, and Rain-Gun irrigation installations.",
        "financial_benefit_max": 65000.0,
        "subsidy_percentage": 55.0,
        "target_crops": ["Tomato", "Chilli", "Cotton", "Maize", "Potato", "Rice / Paddy", "Wheat", "Soybean", "Groundnut", "Sugarcane", "Horticulture"],
        "min_land_acres": 0.2,
        "max_land_acres": 12.5,
        "farmer_categories": ["Marginal (<2.5 acres)", "Small (2.5-5 acres)", "Medium / Large (>5 acres)"],
        "state_applicability": ["All-India"],
        "description": "Flagship micro-irrigation mission saving up to 60% irrigation water while boosting crop yields by 30-45% through targeted root-zone fertigation.",
        "key_eligibility": [
            "Farmers possessing agricultural land with an assured water source (borewell, open well, farm pond, or canal outlet)",
            "Subsidy eligible up to 5 Hectares per beneficiary family",
            "Preference given to water-stressed, drought-prone, and rainfed cultivation taluks"
        ],
        "required_documents": [
            "Aadhaar Card",
            "Land Title Deed / RTC (Pahani) showing landholding details",
            "Water Source Proof (Borewell certificate, pump electricity bill, or canal passbook)",
            "Soil & Water Testing Certificate",
            "Bank Passbook with clear IFSC"
        ],
        "application_steps": [
            "Submit online application via your State Horticulture / Drip Irrigation portal",
            "Verification of farm plot and water source by Assistant Horticulture Officer (AHO)",
            "Selection of authorized micro-irrigation vendor (Jain Irrigation, Netafim, EPC, etc.) for field layout design",
            "Physical GPS-stamped inspection after installation; subsidy credited directly via DBT"
        ],
        "official_portal_url": "https://pmksy.gov.in",
        "helpline_number": "1800-180-1551"
    },
    {
        "code": "PMFBY_INSURANCE",
        "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY Comprehensive Crop Insurance)",
        "short_name": "PMFBY Crop Insurance & Risk Protection",
        "category": "Crop Insurance & Risk Coverage",
        "implementing_agency": "Ministry of Agriculture & Farmers Welfare, Government of India",
        "benefit_summary": "Comprehensive crop yield insurance against flood, drought, pests, unseasonal hailstorms, and post-harvest cyclone damage. Farmer pays only 1.5% to 2% premium, while 90%+ is subsidized by Central & State Govts.",
        "financial_benefit_max": 45000.0,
        "subsidy_percentage": 90.0,
        "target_crops": ["Rice / Paddy", "Wheat", "Cotton", "Tomato", "Soybean", "Potato", "Maize", "Chilli", "Groundnut"],
        "min_land_acres": 0.1,
        "max_land_acres": 100.0,
        "farmer_categories": ["Marginal (<2.5 acres)", "Small (2.5-5 acres)", "Medium / Large (>5 acres)"],
        "state_applicability": ["All-India"],
        "description": "Lowest premium crop loss safety net covering non-preventable natural risks from pre-sowing prevented germination to 14-day post-harvest drying risks.",
        "key_eligibility": [
            "All farmers growing notified crops in notified areas (both loanee and non-loanee farmers are eligible)",
            "Tenant farmers and sharecroppers are eligible with valid sowing declaration",
            "Coverage includes localized natural calamities (hailstorm, inundation, cloudburst)"
        ],
        "required_documents": [
            "Aadhaar Card",
            "Land RTC / Sowing Certificate verified by Village Revenue Officer / Patwari",
            "Bank Account Passbook / Cancellation Cheque",
            "Crop Sowing Declaration indicating acreage and crop variety"
        ],
        "application_steps": [
            "Enroll before the cutoff date on the National Crop Insurance Portal (pmfby.gov.in), nearest Bank, or CSC Kendra",
            "Pay the nominal premium (2% for Kharif crops, 1.5% for Rabi, 5% for Horticulture/Commercial)",
            "Receive policy document and tracking ID via SMS",
            "Report individual crop loss within 72 hours via the 'Crop Insurance' mobile app or 14447 helpline"
        ],
        "official_portal_url": "https://pmfby.gov.in",
        "helpline_number": "14447"
    },
    {
        "code": "SMAM_MACHINERY",
        "name": "Sub-Mission on Agricultural Mechanization (SMAM - Farm Machinery Subsidy)",
        "short_name": "SMAM Tractor & Equipment Subsidy",
        "category": "Farm Mechanization & Machinery",
        "implementing_agency": "Mechanization & Technology Division, MoA&FW, Government of India",
        "benefit_summary": "40% to 50% subsidy (up to ₹1,25,000 on Tractors, Power Tillers, Multi-Crop Threshers, Rotavators, Boom Sprayers, and Drone Sprayers).",
        "financial_benefit_max": 125000.0,
        "subsidy_percentage": 50.0,
        "target_crops": ["ALL"],
        "min_land_acres": 0.5,
        "max_land_acres": 100.0,
        "farmer_categories": ["Marginal (<2.5 acres)", "Small (2.5-5 acres)", "Medium / Large (>5 acres)"],
        "state_applicability": ["All-India"],
        "description": "Financial assistance program to reduce labor costs, modernize small farms, and establish Custom Hiring Centers for agricultural implements.",
        "key_eligibility": [
            "Any landholding farmer registered with Aadhaar in the state",
            "Beneficiary must not have received subsidy for the same category of implement in the past 7 years",
            "Enhanced 50% subsidy quota for Small, Marginal, Women, and SC/ST farmers"
        ],
        "required_documents": [
            "Aadhaar Card",
            "Land Khata / RTC Record",
            "Bank Passbook copy",
            "Proforma Invoice / Quotation from authorized farm equipment dealer",
            "Caste Certificate (if claiming special affirmative subsidy quota)"
        ],
        "application_steps": [
            "Register on the Central Agri Machinery Portal (agrimachinery.nic.in)",
            "Choose equipment type, manufacturer, and authorized dealer",
            "Upload quotation and land documents for District Agriculture Officer (DAO) sanction",
            "Purchase equipment post-sanction and receive direct subsidy reimbursement via DBT"
        ],
        "official_portal_url": "https://agrimachinery.nic.in",
        "helpline_number": "011-23382937"
    },
    {
        "code": "KCC_LOAN",
        "name": "Kisan Credit Card (KCC - Low Interest Crop Loan)",
        "short_name": "KCC Low-Interest Credit Card",
        "category": "Credit & Financial Liquidity",
        "implementing_agency": "Reserve Bank of India (RBI), NABARD, and Commercial & Grameena Banks",
        "benefit_summary": "Collateral-free agricultural loan up to ₹1,60,000 (and up to ₹3,00,000 total credit) at an effective 4% interest rate per annum (7% base rate minus 3% prompt repayment incentive).",
        "financial_benefit_max": 300000.0,
        "subsidy_percentage": 3.0,
        "target_crops": ["ALL"],
        "min_land_acres": 0.1,
        "max_land_acres": 100.0,
        "farmer_categories": ["Marginal (<2.5 acres)", "Small (2.5-5 acres)", "Medium / Large (>5 acres)"],
        "state_applicability": ["All-India"],
        "description": "Revolving credit line ensuring smallholder farmers never face cash crunches for seeds, fertilizers, tractor diesel, or farm labor during peak sowing season.",
        "key_eligibility": [
            "All owner cultivators, tenant farmers, oral lessees, and sharecroppers",
            "Self Help Groups (SHGs) or Joint Liability Groups (JLGs) of smallholder farmers",
            "Also covers working capital for allied activities like dairy cows, poultry, and fisheries"
        ],
        "required_documents": [
            "Filled KCC 1-page simplified loan application form",
            "Aadhaar Card / Voter ID / PAN Card",
            "Land RTC / Revenue extract showing ownership or tenancy declaration",
            "Crop cultivation details for current Kharif / Rabi season"
        ],
        "application_steps": [
            "Submit simplified KCC application at your nearest Commercial Bank, Cooperative Bank, or RRB branch",
            "Bank evaluates credit limit based on crop scale of finance and acreage within 14 days",
            "No collateral or processing fee required for loans up to ₹1.60 Lakh",
            "Receive KCC RuPay debit card for ATM cash withdrawals and PoS seed/fertilizer purchases"
        ],
        "official_portal_url": "https://www.jansamarth.in",
        "helpline_number": "1800-11-5526"
    },
    {
        "code": "PM_KUSUM_SOLAR",
        "name": "PM-KUSUM (Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan)",
        "short_name": "PM-KUSUM 60% Solar Pump Subsidy",
        "category": "Solar Energy & Irrigation",
        "implementing_agency": "Ministry of New and Renewable Energy (MNRE), Government of India",
        "benefit_summary": "60% government subsidy (30% Central + 30% State) for installing standalone 3 HP to 10 HP solar water pumps. Farmer pays only 10% upfront, with remaining 30% available via low-interest bank loan.",
        "financial_benefit_max": 180000.0,
        "subsidy_percentage": 60.0,
        "target_crops": ["ALL"],
        "min_land_acres": 0.5,
        "max_land_acres": 100.0,
        "farmer_categories": ["Marginal (<2.5 acres)", "Small (2.5-5 acres)", "Medium / Large (>5 acres)"],
        "state_applicability": ["All-India"],
        "description": "De-dieselization mission providing reliable, daytime irrigation power with zero recurring monthly electricity bills, plus option to sell surplus solar power back to grid.",
        "key_eligibility": [
            "Individual farmers, water user associations, and farmer producer organizations",
            "Farm plot with viable borewell, open well, or farm pond lacking electric connection or relying on expensive diesel pump",
            "Land ownership documentation required"
        ],
        "required_documents": [
            "Aadhaar Card",
            "Land Record (RTC / 7/12 Extract)",
            "Water Source Certificate / Borewell yield test report",
            "Bank Account Passbook",
            "Passport Size Photograph"
        ],
        "application_steps": [
            "Apply online through your State Renewable Energy Agency portal (e.g., KREDL, MSEDCL, UPNEDA, MEDA)",
            "Pay the 10% farmer share into the nodal agency escrow account post-document scrutiny",
            "Empaneled solar vendor conducts site survey and installs solar PV arrays + submersible motor pump",
            "Physical inspection and commissioning with a 5-year comprehensive manufacturer warranty"
        ],
        "official_portal_url": "https://pmkusum.mnre.gov.in",
        "helpline_number": "1800-180-3333"
    },
    {
        "code": "PKVY_ORGANIC",
        "name": "Paramparagat Krishi Vikas Yojana (PKVY - Organic Farming Incentive)",
        "short_name": "PKVY Organic Cultivation Subsidy",
        "category": "Organic & Natural Farming",
        "implementing_agency": "National Mission on Sustainable Agriculture (NMSA), MoA&FW",
        "benefit_summary": "Financial grant of ₹50,000 per hectare over 3 years (₹31,000/ha provided directly via DBT for organic seeds, bio-fertilizers, vermicompost units, and botanical pest extracts).",
        "financial_benefit_max": 50000.0,
        "subsidy_percentage": 100.0,
        "target_crops": ["Tomato", "Rice / Paddy", "Wheat", "Cotton", "Maize", "Chilli", "Groundnut", "Potato", "Soybean"],
        "min_land_acres": 0.5,
        "max_land_acres": 12.5,
        "farmer_categories": ["Marginal (<2.5 acres)", "Small (2.5-5 acres)", "Medium / Large (>5 acres)"],
        "state_applicability": ["All-India"],
        "description": "Supports transition to chemical-free sustainable agriculture with free Participatory Guarantee System (PGS) organic certification and premium market linkages.",
        "key_eligibility": [
            "Farmers willing to transition to organic/natural farming methods",
            "Organized in clusters of 20 or more farmers covering minimum 20 hectares contiguous land",
            "Individual farmers can join existing registered village clusters"
        ],
        "required_documents": [
            "Aadhaar Card",
            "Land Record (Pahani / RTC)",
            "Cluster Group Registration Details",
            "Bank Account Passbook"
        ],
        "application_steps": [
            "Form or join a 20-farmer cluster via your local Block Agriculture Officer (BAO)",
            "Register on the PGS-India portal (pgsindia-ncof.gov.in)",
            "Implement organic practices and receive input assistance in staged DBT tranches across 3 seasons",
            "Obtain official Green/Organic certification for high-value export and domestic mandi sales"
        ],
        "official_portal_url": "https://pgsindia-ncof.gov.in",
        "helpline_number": "011-23381012"
    },
    {
        "code": "SOIL_HEALTH_CARD",
        "name": "National Soil Health Card Scheme (12-Parameter Nutrient Diagnostic)",
        "short_name": "Free Soil Health Card & Diagnostic",
        "category": "Soil Diagnostics & Yield Optimization",
        "implementing_agency": "Integrated Nutrient Management Division, MoA&FW, GoI",
        "benefit_summary": "100% Free laboratory testing of farm soil across 12 vital chemical & physical indicators (N, P, K, S, Zn, Fe, Cu, Mn, B, pH, Electrical Conductivity, and Organic Carbon) with tailored fertilizer recommendations.",
        "financial_benefit_max": 2500.0,
        "subsidy_percentage": 100.0,
        "target_crops": ["ALL"],
        "min_land_acres": 0.01,
        "max_land_acres": 100.0,
        "farmer_categories": ["Marginal (<2.5 acres)", "Small (2.5-5 acres)", "Medium / Large (>5 acres)"],
        "state_applicability": ["All-India"],
        "description": "Prevents overspending on chemical fertilizers by providing customized scientific dosage guidelines, restoring depleted soil organic matter.",
        "key_eligibility": [
            "All landholder farmers in India",
            "Soil testing cycle conducted once every 2 years for each farm GPS grid"
        ],
        "required_documents": [
            "Aadhaar Card",
            "Land RTC / Survey Number indicating plot location"
        ],
        "application_steps": [
            "Village Agriculture Assistant or Soil Health Volunteer collects GPS-tagged soil samples from your field",
            "Sample analyzed at the District Soil Testing Laboratory",
            "Printed Soil Health Card delivered to the farmer with exact crop-wise NPK dosage instructions",
            "Digital card copy always accessible on soilhealth.dac.gov.in"
        ],
        "official_portal_url": "https://soilhealth.dac.gov.in",
        "helpline_number": "1800-180-1551"
    }
]

class SchemeService:
    async def seed_default_schemes(self):
        """
        Seeds standard Indian agricultural government schemes into PostgreSQL on startup if not present.
        """
        if not prisma_client.is_connected():
            await prisma_client.connect()

        for s in DEFAULT_SCHEMES_DATA:
            existing = await prisma_client.govscheme.find_unique(where={"code": s["code"]})
            if not existing:
                await prisma_client.govscheme.create(
                    data={
                        "code": s["code"],
                        "name": s["name"],
                        "short_name": s["short_name"],
                        "category": s["category"],
                        "implementing_agency": s["implementing_agency"],
                        "benefit_summary": s["benefit_summary"],
                        "financial_benefit_max": s["financial_benefit_max"],
                        "subsidy_percentage": s["subsidy_percentage"],
                        "target_crops": s["target_crops"],
                        "min_land_acres": s["min_land_acres"],
                        "max_land_acres": s["max_land_acres"],
                        "farmer_categories": s["farmer_categories"],
                        "state_applicability": s["state_applicability"],
                        "description": s["description"],
                        "key_eligibility": s["key_eligibility"],
                        "required_documents": s["required_documents"],
                        "application_steps": s["application_steps"],
                        "official_portal_url": s["official_portal_url"],
                        "helpline_number": s["helpline_number"]
                    }
                )
                logger.info(f"Seeded GovScheme: {s['code']}")

    async def get_all_schemes(self) -> List[SchemeOut]:
        """
        Returns all registered schemes from PostgreSQL.
        """
        if not prisma_client.is_connected():
            await prisma_client.connect()

        records = await prisma_client.govscheme.find_many(order={"name": "asc"})
        return [self._to_schema(r) for r in records]

    async def check_eligibility(self, req: EligibilityCheckRequest) -> EligibilityCheckResponse:
        """
        Evaluates a farmer's acreage, crop, state, and category against all schemes.
        """
        if not prisma_client.is_connected():
            await prisma_client.connect()

        # Convert to standard acres
        unit = (req.area_unit or "Acres").strip().lower()
        acres = req.land_area
        if unit == "guntas":
            acres = req.land_area / 40.0
        elif unit == "hectares":
            acres = req.land_area * 2.47105
        elif unit == "bighas":
            acres = req.land_area * 0.625

        # Classify farmer category based on Indian Agriculture Census standards
        if acres <= 2.471:  # < 1 Hectare
            farmer_tier = "Marginal Farmer (< 1 Ha / 2.5 Acres)"
        elif acres <= 4.942:  # 1 - 2 Hectares
            farmer_tier = "Small Farmer (1 - 2 Ha / 2.5 - 5 Acres)"
        elif acres <= 9.884:  # 2 - 4 Hectares
            farmer_tier = "Semi-Medium Farmer (2 - 4 Ha)"
        else:
            farmer_tier = "Medium / Large Farmer (> 4 Ha)"

        schemes = await prisma_client.govscheme.find_many()
        results: List[SchemeMatchResult] = []
        total_benefit = 0.0
        eligible_count = 0

        crop_norm = (req.crop_name or "").strip().lower()
        state_norm = (req.state or "All-India").strip().lower()

        for s in schemes:
            score = 100
            reasons = []

            # 1. Land acreage check
            if s.min_land_acres is not None and acres < s.min_land_acres:
                score -= 30
                reasons.append(f"Holding of {acres:.2f} acres is below minimum required {s.min_land_acres} acres.")
            else:
                reasons.append(f"Landholding ({acres:.2f} acres) satisfies scheme requirements.")

            if s.max_land_acres is not None and acres > s.max_land_acres:
                score -= 40
                reasons.append(f"Holding of {acres:.2f} acres exceeds maximum ceiling of {s.max_land_acres} acres.")

            # 2. Crop match check
            if "ALL" in s.target_crops or "all" in [c.lower() for c in s.target_crops]:
                reasons.append("Applicable across all agricultural & horticultural crops.")
            elif crop_norm:
                matched_crop = any(crop_norm in c.lower() or c.lower() in crop_norm for c in s.target_crops)
                if matched_crop:
                    reasons.append(f"Directly applicable for your crop: {req.crop_name}.")
                else:
                    score -= 20
                    reasons.append(f"Priority given to specified crops ({', '.join(s.target_crops[:3])}), but open to general agriculture.")

            # 3. State applicability
            if "All-India" in s.state_applicability or "all-india" in [st.lower() for st in s.state_applicability]:
                reasons.append("Active centrally sponsored scheme nationwide across all Indian states.")
            elif state_norm and state_norm != "all-india":
                state_match = any(state_norm in st.lower() or st.lower() in state_norm for st in s.state_applicability)
                if state_match:
                    reasons.append(f"Active in your state: {req.state}.")
                else:
                    score -= 25
                    reasons.append(f"State quota subject to local district allocation in {req.state}.")

            # 4. Special boost for Small & Marginal farmers for PMKSY / SMAM
            if acres <= 5.0 and s.code in ["PM_SINCHAYEE_PDMC", "SMAM_MACHINERY", "PM_KISAN"]:
                score = min(100, score + 10)
                reasons.append("Higher priority & maximum 55% subsidy tier for Small & Marginal landholders.")

            score = max(20, min(100, score))
            is_eligible = score >= 60

            # Calculate estimated financial benefit
            scheme_benefit = 0.0
            if is_eligible and s.financial_benefit_max:
                if s.code == "PM_KISAN":
                    scheme_benefit = 6000.0
                elif s.code == "PM_SINCHAYEE_PDMC":
                    # Pro-rate based on acres (approx ₹25,000 subsidy per acre up to max)
                    scheme_benefit = min(s.financial_benefit_max, acres * 22000.0)
                elif s.code == "PMFBY_INSURANCE":
                    # Estimated risk coverage value
                    scheme_benefit = min(s.financial_benefit_max, acres * 15000.0)
                elif s.code == "SOIL_HEALTH_CARD":
                    scheme_benefit = 2500.0
                elif s.code == "KCC_LOAN":
                    # Annual interest savings (3% subvention on typical 1.5L credit)
                    scheme_benefit = 4500.0
                elif s.code == "PM_KUSUM_SOLAR":
                    scheme_benefit = min(s.financial_benefit_max, 120000.0)
                else:
                    scheme_benefit = s.financial_benefit_max

            if is_eligible:
                eligible_count += 1
                total_benefit += scheme_benefit

            subsidy_str = f"{s.subsidy_percentage:.0f}% Subsidy" if s.subsidy_percentage else "Direct Financial Benefit"
            if s.code == "PM_KISAN":
                subsidy_str = "₹6,000 / year (Direct DBT Cash)"

            results.append(
                SchemeMatchResult(
                    scheme=self._to_schema(s),
                    is_eligible=is_eligible,
                    match_score=score,
                    match_reasons=reasons,
                    estimated_financial_benefit=round(scheme_benefit, 2),
                    subsidy_text=subsidy_str
                )
            )

        # Sort results: eligible first, then by match score desc
        results.sort(key=lambda r: (r.is_eligible, r.match_score), reverse=True)

        return EligibilityCheckResponse(
            total_schemes_evaluated=len(schemes),
            eligible_schemes_count=eligible_count,
            total_estimated_benefit_inr=round(total_benefit, 2),
            land_in_acres=round(acres, 2),
            farmer_tier=farmer_tier,
            results=results
        )

    async def save_farmer_scheme(self, req: SaveSchemeRequest) -> SavedSchemeResponse:
        """
        Bookmarks or saves a scheme for a registered farmer in PostgreSQL.
        """
        if not prisma_client.is_connected():
            await prisma_client.connect()

        scheme = await prisma_client.govscheme.find_unique(where={"id": req.scheme_id})
        if not scheme:
            raise ValueError(f"Scheme ID {req.scheme_id} not found.")

        existing = await prisma_client.savedfarmerscheme.find_first(
            where={"farmer_id": req.farmer_id, "scheme_id": req.scheme_id}
        )
        if existing:
            return SavedSchemeResponse(
                id=existing.id,
                farmer_id=existing.farmer_id,
                scheme_id=existing.scheme_id,
                scheme_code=existing.scheme_code,
                scheme_name=existing.scheme_name,
                status=existing.status,
                created_at=existing.created_at.strftime("%Y-%m-%d %H:%M")
            )

        saved = await prisma_client.savedfarmerscheme.create(
            data={
                "farmer_id": req.farmer_id,
                "scheme_id": req.scheme_id,
                "scheme_code": scheme.code,
                "scheme_name": scheme.name,
                "status": "SAVED"
            }
        )

        return SavedSchemeResponse(
            id=saved.id,
            farmer_id=saved.farmer_id,
            scheme_id=saved.scheme_id,
            scheme_code=saved.scheme_code,
            scheme_name=saved.scheme_name,
            status=saved.status,
            created_at=saved.created_at.strftime("%Y-%m-%d %H:%M")
        )

    async def get_farmer_saved_schemes(self, farmer_id: str) -> List[SavedSchemeResponse]:
        """
        Retrieves all saved schemes for a given farmer.
        """
        if not prisma_client.is_connected():
            await prisma_client.connect()

        records = await prisma_client.savedfarmerscheme.find_many(
            where={"farmer_id": farmer_id},
            order={"created_at": "desc"}
        )
        return [
            SavedSchemeResponse(
                id=r.id,
                farmer_id=r.farmer_id,
                scheme_id=r.scheme_id,
                scheme_code=r.scheme_code,
                scheme_name=r.scheme_name,
                status=r.status,
                created_at=r.created_at.strftime("%Y-%m-%d %H:%M")
            )
            for r in records
        ]

    def _to_schema(self, r) -> SchemeOut:
        return SchemeOut(
            id=r.id,
            code=r.code,
            name=r.name,
            short_name=r.short_name,
            category=r.category,
            implementing_agency=r.implementing_agency,
            benefit_summary=r.benefit_summary,
            financial_benefit_max=r.financial_benefit_max,
            subsidy_percentage=r.subsidy_percentage,
            target_crops=r.target_crops or [],
            min_land_acres=r.min_land_acres,
            max_land_acres=r.max_land_acres,
            farmer_categories=r.farmer_categories or [],
            state_applicability=r.state_applicability or [],
            description=r.description,
            key_eligibility=r.key_eligibility or [],
            required_documents=r.required_documents or [],
            application_steps=r.application_steps or [],
            official_portal_url=r.official_portal_url,
            helpline_number=r.helpline_number,
            created_at=r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else None
        )

scheme_service = SchemeService()
