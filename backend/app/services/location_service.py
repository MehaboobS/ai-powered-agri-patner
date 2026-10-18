from typing import List, Optional
from app.schemas.location import LocationItem

INDIAN_AGRICULTURAL_LOCATIONS = [
    # Karnataka
    {"id": "kar-kolar", "city": "Kolar", "state": "Karnataka", "display_name": "Kolar, Karnataka", "latitude": 13.13, "longitude": 78.13, "major_crops": ["Tomato", "Vegetables", "Mango"]},
    {"id": "kar-bengaluru", "city": "Bengaluru", "state": "Karnataka", "display_name": "Bengaluru, Karnataka", "latitude": 12.97, "longitude": 77.59, "major_crops": ["Rose Onion", "Vegetables", "Flowers"]},
    {"id": "kar-davanagere", "city": "Davanagere", "state": "Karnataka", "display_name": "Davanagere, Karnataka", "latitude": 14.46, "longitude": 75.92, "major_crops": ["Maize", "Paddy", "Sugarcane"]},
    {"id": "kar-haveri", "city": "Byadagi", "state": "Karnataka", "display_name": "Byadagi, Karnataka", "latitude": 14.68, "longitude": 75.48, "major_crops": ["Byadagi Chilli", "Cotton", "Groundnut"]},
    {"id": "kar-hassan", "city": "Hassan", "state": "Karnataka", "display_name": "Hassan, Karnataka", "latitude": 13.00, "longitude": 76.10, "major_crops": ["Potato", "Coffee", "Ginger"]},
    {"id": "kar-belagavi", "city": "Belagavi", "state": "Karnataka", "display_name": "Belagavi, Karnataka", "latitude": 15.85, "longitude": 74.50, "major_crops": ["Sugarcane", "Paddy", "Soybean"]},
    {"id": "kar-raichur", "city": "Raichur", "state": "Karnataka", "display_name": "Raichur, Karnataka", "latitude": 16.21, "longitude": 77.34, "major_crops": ["Cotton", "Paddy", "Pigeon Pea"]},
    {"id": "kar-chitradurga", "city": "Challakere", "state": "Karnataka", "display_name": "Challakere, Karnataka", "latitude": 14.31, "longitude": 76.65, "major_crops": ["Groundnut", "Pomegranate", "Onion"]},
    {"id": "kar-shimoga", "city": "Shimoga", "state": "Karnataka", "display_name": "Shimoga, Karnataka", "latitude": 13.92, "longitude": 75.56, "major_crops": ["Arecanut", "Paddy", "Ginger"]},
    {"id": "kar-mysuru", "city": "Mysuru", "state": "Karnataka", "display_name": "Mysuru, Karnataka", "latitude": 12.30, "longitude": 76.65, "major_crops": ["Paddy", "Ragi", "Cotton"]},

    # Maharashtra
    {"id": "mah-nashik", "city": "Nashik", "state": "Maharashtra", "display_name": "Nashik, Maharashtra", "latitude": 19.99, "longitude": 73.78, "major_crops": ["Onion", "Grapes", "Tomato"]},
    {"id": "mah-lasalgaon", "city": "Lasalgaon", "state": "Maharashtra", "display_name": "Lasalgaon, Maharashtra", "latitude": 20.14, "longitude": 74.22, "major_crops": ["Red Onion", "Maize", "Wheat"]},
    {"id": "mah-pimpalgaon", "city": "Pimpalgaon", "state": "Maharashtra", "display_name": "Pimpalgaon, Maharashtra", "latitude": 20.17, "longitude": 73.98, "major_crops": ["Tomato", "Onion", "Soybean"]},
    {"id": "mah-pune", "city": "Pune", "state": "Maharashtra", "display_name": "Pune, Maharashtra", "latitude": 18.52, "longitude": 73.85, "major_crops": ["Sugarcane", "Wheat", "Vegetables"]},
    {"id": "mah-nagpur", "city": "Nagpur", "state": "Maharashtra", "display_name": "Nagpur, Maharashtra", "latitude": 21.14, "longitude": 79.08, "major_crops": ["Orange", "Cotton", "Soybean"]},
    {"id": "mah-latur", "city": "Latur", "state": "Maharashtra", "display_name": "Latur, Maharashtra", "latitude": 18.40, "longitude": 76.56, "major_crops": ["Soybean", "Tur / Pulses", "Gram"]},
    {"id": "mah-solapur", "city": "Solapur", "state": "Maharashtra", "display_name": "Solapur, Maharashtra", "latitude": 17.66, "longitude": 75.90, "major_crops": ["Pomegranate", "Jowar", "Sugarcane"]},
    {"id": "mah-jalgaon", "city": "Jalgaon", "state": "Maharashtra", "display_name": "Jalgaon, Maharashtra", "latitude": 21.00, "longitude": 75.56, "major_crops": ["Banana", "Cotton", "Pulses"]},
    {"id": "mah-ahmednagar", "city": "Ahmednagar", "state": "Maharashtra", "display_name": "Ahmednagar, Maharashtra", "latitude": 19.09, "longitude": 74.74, "major_crops": ["Sugarcane", "Onion", "Millets"]},

    # Andhra Pradesh
    {"id": "ap-guntur", "city": "Guntur", "state": "Andhra Pradesh", "display_name": "Guntur, Andhra Pradesh", "latitude": 16.30, "longitude": 80.44, "major_crops": ["Red Chilli", "Cotton", "Tobacco"]},
    {"id": "ap-madanapalle", "city": "Madanapalle", "state": "Andhra Pradesh", "display_name": "Madanapalle, Andhra Pradesh", "latitude": 13.55, "longitude": 78.50, "major_crops": ["Tomato", "Mango", "Groundnut"]},
    {"id": "ap-kurnool", "city": "Kurnool", "state": "Andhra Pradesh", "display_name": "Kurnool, Andhra Pradesh", "latitude": 15.82, "longitude": 78.03, "major_crops": ["Onion", "Cotton", "Groundnut"]},
    {"id": "ap-vijayawada", "city": "Vijayawada", "state": "Andhra Pradesh", "display_name": "Vijayawada, Andhra Pradesh", "latitude": 16.50, "longitude": 80.64, "major_crops": ["Paddy", "Sugarcane", "Turmeric"]},
    {"id": "ap-chittoor", "city": "Chittoor", "state": "Andhra Pradesh", "display_name": "Chittoor, Andhra Pradesh", "latitude": 13.21, "longitude": 79.10, "major_crops": ["Mango", "Sugarcane", "Groundnut"]},
    {"id": "ap-anantapur", "city": "Anantapur", "state": "Andhra Pradesh", "display_name": "Anantapur, Andhra Pradesh", "latitude": 14.68, "longitude": 77.60, "major_crops": ["Groundnut", "Sweet Orange", "Pomegranate"]},

    # Telangana
    {"id": "tg-warangal", "city": "Warangal", "state": "Telangana", "display_name": "Warangal, Telangana", "latitude": 17.97, "longitude": 79.59, "major_crops": ["Cotton", "Chilli", "Paddy"]},
    {"id": "tg-suryapet", "city": "Suryapet", "state": "Telangana", "display_name": "Suryapet, Telangana", "latitude": 17.14, "longitude": 79.62, "major_crops": ["Paddy", "Cotton", "Pulses"]},
    {"id": "tg-karimnagar", "city": "Karimnagar", "state": "Telangana", "display_name": "Karimnagar, Telangana", "latitude": 18.43, "longitude": 79.12, "major_crops": ["Paddy", "Maize", "Cotton"]},
    {"id": "tg-nizamabad", "city": "Nizamabad", "state": "Telangana", "display_name": "Nizamabad, Telangana", "latitude": 18.67, "longitude": 78.09, "major_crops": ["Turmeric", "Paddy", "Soybean"]},
    {"id": "tg-khammam", "city": "Khammam", "state": "Telangana", "display_name": "Khammam, Telangana", "latitude": 17.24, "longitude": 80.15, "major_crops": ["Chilli", "Cotton", "Mango"]},

    # Punjab
    {"id": "pb-ludhiana", "city": "Ludhiana", "state": "Punjab", "display_name": "Ludhiana, Punjab", "latitude": 30.90, "longitude": 75.85, "major_crops": ["Wheat", "Paddy", "Potato"]},
    {"id": "pb-khanna", "city": "Khanna", "state": "Punjab", "display_name": "Khanna, Punjab", "latitude": 30.70, "longitude": 76.21, "major_crops": ["Wheat", "Basmati Paddy", "Maize"]},
    {"id": "pb-bathinda", "city": "Bathinda", "state": "Punjab", "display_name": "Bathinda, Punjab", "latitude": 30.21, "longitude": 74.94, "major_crops": ["Cotton", "Wheat", "Mustard"]},
    {"id": "pb-amritsar", "city": "Amritsar", "state": "Punjab", "display_name": "Amritsar, Punjab", "latitude": 31.63, "longitude": 74.87, "major_crops": ["Basmati Rice", "Wheat", "Vegetables"]},
    {"id": "pb-jalandhar", "city": "Jalandhar", "state": "Punjab", "display_name": "Jalandhar, Punjab", "latitude": 31.32, "longitude": 75.57, "major_crops": ["Potato Seed", "Wheat", "Maize"]},

    # Haryana
    {"id": "hr-karnal", "city": "Karnal", "state": "Haryana", "display_name": "Karnal, Haryana", "latitude": 29.68, "longitude": 76.99, "major_crops": ["Basmati Rice", "Wheat", "Sugarcane"]},
    {"id": "hr-kurukshetra", "city": "Kurukshetra", "state": "Haryana", "display_name": "Kurukshetra, Haryana", "latitude": 29.96, "longitude": 76.87, "major_crops": ["Paddy", "Wheat", "Sunflower"]},
    {"id": "hr-hisar", "city": "Hisar", "state": "Haryana", "display_name": "Hisar, Haryana", "latitude": 29.15, "longitude": 75.72, "major_crops": ["Cotton", "Wheat", "Guar"]},
    {"id": "hr-sirsa", "city": "Sirsa", "state": "Haryana", "display_name": "Sirsa, Haryana", "latitude": 29.53, "longitude": 75.03, "major_crops": ["Cotton", "Wheat", "Mustard"]},

    # Gujarat
    {"id": "gj-rajkot", "city": "Rajkot", "state": "Gujarat", "display_name": "Rajkot, Gujarat", "latitude": 22.30, "longitude": 70.80, "major_crops": ["Groundnut", "Cotton", "Cumin"]},
    {"id": "gj-anand", "city": "Anand", "state": "Gujarat", "display_name": "Anand, Gujarat", "latitude": 22.56, "longitude": 72.92, "major_crops": ["Tobacco", "Banana", "Pulses"]},
    {"id": "gj-deesa", "city": "Deesa", "state": "Gujarat", "display_name": "Deesa, Gujarat", "latitude": 24.25, "longitude": 72.18, "major_crops": ["Potato", "Mustard", "Castor"]},
    {"id": "gj-surat", "city": "Surat", "state": "Gujarat", "display_name": "Surat, Gujarat", "latitude": 21.17, "longitude": 72.83, "major_crops": ["Sugarcane", "Paddy", "Banana"]},

    # Uttar Pradesh
    {"id": "up-agra", "city": "Agra", "state": "Uttar Pradesh", "display_name": "Agra, Uttar Pradesh", "latitude": 27.17, "longitude": 78.00, "major_crops": ["Potato", "Mustard", "Wheat"]},
    {"id": "up-varanasi", "city": "Varanasi", "state": "Uttar Pradesh", "display_name": "Varanasi, Uttar Pradesh", "latitude": 25.31, "longitude": 82.97, "major_crops": ["Vegetables", "Paddy", "Wheat"]},
    {"id": "up-bareilly", "city": "Bareilly", "state": "Uttar Pradesh", "display_name": "Bareilly, Uttar Pradesh", "latitude": 28.36, "longitude": 79.43, "major_crops": ["Sugarcane", "Paddy", "Wheat"]},
    {"id": "up-aligarh", "city": "Aligarh", "state": "Uttar Pradesh", "display_name": "Aligarh, Uttar Pradesh", "latitude": 27.89, "longitude": 78.08, "major_crops": ["Wheat", "Barley", "Mustard"]},

    # Madhya Pradesh
    {"id": "mp-indore", "city": "Indore", "state": "Madhya Pradesh", "display_name": "Indore, Madhya Pradesh", "latitude": 22.71, "longitude": 75.85, "major_crops": ["Soybean", "Wheat", "Garlic"]},
    {"id": "mp-sehore", "city": "Sehore", "state": "Madhya Pradesh", "display_name": "Sehore, Madhya Pradesh", "latitude": 23.20, "longitude": 77.08, "major_crops": ["Sharbati Wheat", "Soybean", "Gram"]},
    {"id": "mp-chhindwara", "city": "Chhindwara", "state": "Madhya Pradesh", "display_name": "Chhindwara, Madhya Pradesh", "latitude": 22.05, "longitude": 78.93, "major_crops": ["Maize", "Cotton", "Potato"]},
    {"id": "mp-ujjain", "city": "Ujjain", "state": "Madhya Pradesh", "display_name": "Ujjain, Madhya Pradesh", "latitude": 23.17, "longitude": 75.78, "major_crops": ["Soybean", "Wheat", "Gram"]},

    # Tamil Nadu
    {"id": "tn-thanjavur", "city": "Thanjavur", "state": "Tamil Nadu", "display_name": "Thanjavur, Tamil Nadu", "latitude": 10.78, "longitude": 79.13, "major_crops": ["Paddy (Rice Bowl)", "Banana", "Coconut"]},
    {"id": "tn-erode", "city": "Erode", "state": "Tamil Nadu", "display_name": "Erode, Tamil Nadu", "latitude": 11.34, "longitude": 77.72, "major_crops": ["Turmeric (Yellow City)", "Sugarcane", "Coconut"]},
    {"id": "tn-coimbatore", "city": "Coimbatore", "state": "Tamil Nadu", "display_name": "Coimbatore, Tamil Nadu", "latitude": 11.01, "longitude": 76.96, "major_crops": ["Cotton", "Vegetables", "Tea"]},
    {"id": "tn-madurai", "city": "Madurai", "state": "Tamil Nadu", "display_name": "Madurai, Tamil Nadu", "latitude": 9.92, "longitude": 78.11, "major_crops": ["Jasmine", "Paddy", "Pulses"]},

    # Rajasthan
    {"id": "rj-kota", "city": "Kota", "state": "Rajasthan", "display_name": "Kota, Rajasthan", "latitude": 25.18, "longitude": 75.83, "major_crops": ["Soybean", "Wheat", "Coriander"]},
    {"id": "rj-alwar", "city": "Alwar", "state": "Rajasthan", "display_name": "Alwar, Rajasthan", "latitude": 27.55, "longitude": 76.63, "major_crops": ["Mustard", "Onion", "Wheat"]},
    {"id": "rj-ganganagar", "city": "Sri Ganganagar", "state": "Rajasthan", "display_name": "Sri Ganganagar, Rajasthan", "latitude": 29.90, "longitude": 73.87, "major_crops": ["Kinnow", "Cotton", "Wheat"]},

    # Delhi NCR
    {"id": "dl-delhi", "city": "Delhi", "state": "Delhi", "display_name": "Delhi, Delhi", "latitude": 28.71, "longitude": 77.18, "major_crops": ["Azadpur APMC Terminal", "Vegetables", "Fruits"]},

    # Bihar
    {"id": "br-patna", "city": "Patna", "state": "Bihar", "display_name": "Patna, Bihar", "latitude": 25.59, "longitude": 85.13, "major_crops": ["Paddy", "Wheat", "Maize"]},
    {"id": "br-muzaffarpur", "city": "Muzaffarpur", "state": "Bihar", "display_name": "Muzaffarpur, Bihar", "latitude": 26.12, "longitude": 85.39, "major_crops": ["Shahi Litchi", "Maize", "Paddy"]},

    # West Bengal
    {"id": "wb-burdwan", "city": "Bardhaman", "state": "West Bengal", "display_name": "Bardhaman, West Bengal", "latitude": 23.23, "longitude": 87.86, "major_crops": ["Paddy", "Potato", "Jute"]},
    {"id": "wb-siliguri", "city": "Siliguri", "state": "West Bengal", "display_name": "Siliguri, West Bengal", "latitude": 26.72, "longitude": 88.43, "major_crops": ["Tea", "Pineapple", "Ginger"]},

    # Kerala
    {"id": "kl-wayanad", "city": "Wayanad", "state": "Kerala", "display_name": "Wayanad, Kerala", "latitude": 11.68, "longitude": 76.13, "major_crops": ["Pepper", "Cardamom", "Coffee"]},
    {"id": "kl-palakkad", "city": "Palakkad", "state": "Kerala", "display_name": "Palakkad, Kerala", "latitude": 10.78, "longitude": 76.65, "major_crops": ["Paddy", "Banana", "Vegetables"]},

    # Odisha
    {"id": "od-bargarh", "city": "Bargarh", "state": "Odisha", "display_name": "Bargarh, Odisha", "latitude": 21.33, "longitude": 83.62, "major_crops": ["Paddy (Rice Bowl of Odisha)", "Pulses", "Sugarcane"]}
]

import logging
from app.core.db import prisma_client

logger = logging.getLogger(__name__)

class LocationService:
    async def get_all_locations(self) -> List[LocationItem]:
        """
        Returns all agricultural locations from PostgreSQL via Prisma Client Python.
        Falls back to local pre-seeded catalog if database is not connected.
        """
        if prisma_client.is_connected():
            try:
                db_locs = await prisma_client.location.find_many(
                    order={"display_name": "asc"}
                )
                if db_locs:
                    return [
                        LocationItem(
                            id=loc.id,
                            city=loc.city,
                            state=loc.state,
                            display_name=loc.display_name,
                            latitude=loc.latitude,
                            longitude=loc.longitude,
                            major_crops=loc.major_crops or []
                        )
                        for loc in db_locs
                    ]
            except Exception as e:
                logger.warning(f"Failed to query locations from PostgreSQL via Prisma: {e}")

        # In-memory fallback
        return [LocationItem(**loc) for loc in INDIAN_AGRICULTURAL_LOCATIONS]

    async def search_locations(self, query: Optional[str] = None, limit: int = 5) -> List[LocationItem]:
        """
        Filters locations by City or State case-insensitively using PostgreSQL via Prisma.
        """
        if prisma_client.is_connected() and query and query.strip():
            try:
                q = query.strip()
                db_locs = await prisma_client.location.find_many(
                    where={
                        "OR": [
                            {"city": {"contains": q, "mode": "insensitive"}},
                            {"state": {"contains": q, "mode": "insensitive"}},
                            {"display_name": {"contains": q, "mode": "insensitive"}}
                        ]
                    },
                    take=limit,
                    order={"display_name": "asc"}
                )
                if db_locs:
                    return [
                        LocationItem(
                            id=loc.id,
                            city=loc.city,
                            state=loc.state,
                            display_name=loc.display_name,
                            latitude=loc.latitude,
                            longitude=loc.longitude,
                            major_crops=loc.major_crops or []
                        )
                        for loc in db_locs
                    ]
            except Exception as e:
                logger.warning(f"Prisma search failed, falling back to memory: {e}")

        all_locs = await self.get_all_locations()
        if not query or not query.strip():
            return all_locs[:limit]

        q = query.strip().lower()
        matched = []

        for loc in all_locs:
            city_lower = loc.city.lower()
            state_lower = loc.state.lower()
            display_lower = loc.display_name.lower()

            # Exact prefix match gets priority
            if display_lower.startswith(q) or city_lower.startswith(q) or state_lower.startswith(q):
                matched.append(loc)
            elif q in display_lower:
                matched.append(loc)

            if len(matched) >= limit:
                break

        return matched

location_service = LocationService()
