import sys
import os
import random
from datetime import date, timedelta, datetime, timezone

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.amenity import Amenity
from app.models.listing import Listing, ListingPhoto
from app.models.booking import Booking
from app.models.review import Review
from app.models.wishlist import Wishlist

# Standard amenities
AMENITIES_DATA = [
    {"name": "Fast Wi-Fi", "icon_key": "wifi"},
    {"name": "Private Pool", "icon_key": "pool"},
    {"name": "Chef Kitchen", "icon_key": "kitchen"},
    {"name": "Free Parking", "icon_key": "parking"},
    {"name": "Air Conditioning", "icon_key": "ac"},
    {"name": "HD TV", "icon_key": "tv"},
    {"name": "Dedicated Workspace", "icon_key": "workspace"},
    {"name": "Patio & Deck", "icon_key": "patio"},
    {"name": "Hot Tub", "icon_key": "hot_tub"},
    {"name": "Gym Access", "icon_key": "gym"},
    {"name": "Beach Access", "icon_key": "beach"},
    {"name": "Ocean View", "icon_key": "ocean"},
    {"name": "BBQ Grill", "icon_key": "bbq"},
]

# Cities & Coordinates
CITIES_DATA = [
    {"city": "Candolim", "state": "Goa", "lat": 15.5176, "lng": 73.7628},
    {"city": "North Goa", "state": "Goa", "lat": 15.5898, "lng": 73.7431},
    {"city": "Nerul", "state": "Goa", "lat": 15.5024, "lng": 73.7854},
    {"city": "Anjuna", "state": "Goa", "lat": 15.5833, "lng": 73.7436},
    {"city": "Siolim", "state": "Goa", "lat": 15.6174, "lng": 73.7621},
    {"city": "Lonavala", "state": "Maharashtra", "lat": 18.7557, "lng": 73.4091},
    {"city": "South Goa", "state": "Goa", "lat": 15.2736, "lng": 73.9581},
]

# Stock photos curated from Unsplash
PHOTO_POOLS = [
    [
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    ],
    [
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    ],
    [
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    ],
    [
        "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
    ],
    [
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
    ]
]

LISTING_TITLES = [
    ("Villa Sereno - Luxury Infinity Pool Sanctuary", "Villa", "Amazing views", 14500),
    ("Sunset Palm Beachfront House", "House", "Beachfront", 18200),
    ("The Glasshouse Retreat in Siolim", "Villa", "Luxury", 22000),
    ("Cozy Wooden Cabin surrounded by Pines", "Cabin", "Cabins", 8900),
    ("Nerul Creek Heritage Portuguese Bungalow", "Cottage", "Trending", 12500),
    ("Hilltop Cloud Villa with Panoramic Valley Views", "Villa", "Amazing views", 19500),
    ("Candolim Minimalist Studio 2-min to Beach", "Apartment", "Beachfront", 4800),
    ("Boho Chic Loft with Private Jacuzzi", "Apartment", "Trending", 7500),
    ("Verdant Garden Oasis & Private Pool", "Villa", "Countryside", 16000),
    ("Anjuna Artist Haven near Flea Market", "House", "Iconic cities", 6200),
    ("Cliffside Ocean Breeze Mansion", "Villa", "Amazing views", 35000),
    ("Lonavala Mist Valley Chalet", "Cabin", "Cabins", 11000),
    ("Palolem Bay Coconut Grove Cottage", "Cottage", "Beachfront", 5500),
    ("Fontainhas Latin Quarter Boutique Stay", "Apartment", "Iconic cities", 6800),
    ("Rustic Eco Treehouse with Outdoor Shower", "Cabin", "Cabins", 7200),
    ("Serene Riverfront Hideaway", "House", "Countryside", 9800),
    ("Ultra Modern Glass Villa with Private Cinema", "Villa", "Luxury", 28000),
    ("Chaparral Ridge Sunset Suite", "Apartment", "Amazing views", 8400),
    ("Portuguese Colonial Estate & Lotus Pond", "Villa", "Trending", 24000),
    ("Morjim Eco Beach Hut", "Cottage", "Beachfront", 4200),
    ("Vagator Cliffside Infinity Suite", "Apartment", "Trending", 13000),
    ("Green Valley Wood Chalet in Lonavala", "Cabin", "Cabins", 9500),
    ("Calangute Beach Walk Penthouse", "Apartment", "Beachfront", 15000),
    ("Sinquerim Fort View Luxury Flat", "Apartment", "Amazing views", 11500),
    ("Benaulim White Sand Haven", "House", "Beachfront", 8800),
    ("Whispering Palms Private Villa", "Villa", "Luxury", 21000),
    ("Assagao Designer Courtyard Home", "House", "Trending", 17500),
    ("Khandala Peak Hillside Cabin", "Cabin", "Cabins", 10500),
    ("Majorda Beach Heritage Residency", "Cottage", "Countryside", 7900),
    ("Baga River Deck Sunset Villa", "Villa", "Amazing views", 16800),
    ("Dona Paula Bay Panorama Loft", "Apartment", "Amazing views", 14200),
    ("Old Goa Heritage Plantation Homestay", "Cottage", "Countryside", 6500),
    # EXPERIENCES & SERVICES
    ("Goa Sunset Catamaran Sailing & Drinks", "Experience", "Experiences", 3500),
    ("Authentic Goan Seafood Masterclass with Chef", "Experience", "Experiences", 2800),
    ("Grand Island Scuba Diving & Snorkeling Tour", "Experience", "Experiences", 4200),
    ("Fontainhas Heritage Photo Walk & Coffee", "Experience", "Experiences", 1500),
    ("Private Villa Chef & Fine Dining Experience", "Service", "Services", 6000),
    ("Airport Luxury Sedan Transfer & Refreshments", "Service", "Services", 2500),
    ("Full Day Private Driver & Sightseeing Car", "Service", "Services", 4500),
    ("Daily In-Villa Spa & Aromatherapy Massage", "Service", "Services", 5000),
]

REVIEW_COMMENTS = [
    "Absolutely breathtaking stay! The host was super responsive and the views exceeded all expectations. Will definitely come back!",
    "Clean, spacious, and extremely comfortable beds. The pool was pristine. 10/10 experience.",
    "Great location close to local cafes and beaches. The amenities were top notch.",
    "A serene getaway away from city noise. Highly recommended for families or small groups.",
    "Host went above and beyond with recommendations. Superhost status well deserved!",
    "Loved the architecture and modern lighting. Perfect for a relaxing weekend.",
    "The photos don't do this place justice! It was even more beautiful in person.",
    "Smooth check-in, spotless cleanliness, and incredible sunset views."
]

def seed_db():
    db = SessionLocal()
    try:
        print("Seeding database...")
        # Clear existing tables
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        hashed_pwd = get_password_hash("password123")

        # 1. Create Users
        demo_both = User(
            name="Demo User",
            email="demo.both@airbnb.clone",
            password_hash=hashed_pwd,
            role="both",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
            is_superhost=True
        )
        demo_guest = User(
            name="Alex Guest",
            email="demo.guest@airbnb.clone",
            password_hash=hashed_pwd,
            role="guest",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
            is_superhost=False
        )
        demo_host = User(
            name="Sarah Host",
            email="demo.host@airbnb.clone",
            password_hash=hashed_pwd,
            role="host",
            avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
            is_superhost=True
        )

        hosts = [demo_both, demo_host]
        host_names = [
            ("Rohan Sharma", "rohan@airbnb.clone", True),
            ("Priya Patel", "priya@airbnb.clone", True),
            ("Vikram Rao", "vikram@airbnb.clone", False),
            ("Ananya Roy", "ananya@airbnb.clone", True),
            ("Kabir Mehta", "kabir@airbnb.clone", False),
            ("Devika Nair", "devika@airbnb.clone", False),
        ]
        for name, email, is_sh in host_names:
            h = User(
                name=name,
                email=email,
                password_hash=hashed_pwd,
                role="host",
                avatar_url=f"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
                is_superhost=is_sh
            )
            hosts.append(h)

        guests = [demo_both, demo_guest]
        guest_names = [
            ("Arjun Verma", "arjun@airbnb.clone"),
            ("Sneha Iyer", "sneha@airbnb.clone"),
            ("Rahul Kapoor", "rahul@airbnb.clone")
        ]
        for name, email in guest_names:
            g = User(
                name=name,
                email=email,
                password_hash=hashed_pwd,
                role="guest",
                avatar_url="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&auto=format&fit=crop&q=80"
            )
            guests.append(g)

        all_users = list(set(hosts + guests))
        db.add_all(all_users)
        db.commit()
        for u in all_users:
            db.refresh(u)

        # 2. Create Amenities
        db_amenities = []
        for a_data in AMENITIES_DATA:
            amen = Amenity(name=a_data["name"], icon_key=a_data["icon_key"])
            db.add(amen)
            db_amenities.append(amen)
        db.commit()

        # 3. Create Listings
        db_listings = []
        for i, (title, prop_type, cat, price) in enumerate(LISTING_TITLES):
            host = hosts[i % len(hosts)]
            loc = CITIES_DATA[i % len(CITIES_DATA)]
            lat_jitter = loc["lat"] + random.uniform(-0.02, 0.02)
            lng_jitter = loc["lng"] + random.uniform(-0.02, 0.02)

            listing = Listing(
                host_id=host.id,
                title=title,
                description=f"Experience living in true comfort at {title}. Nestled in {loc['city']}, this property offers stunning architecture, high-speed WiFi, modern kitchen appliances, and relaxing outdoor spaces. Perfect for remote work, family vacations, or romantic escapes.",
                property_type=prop_type,
                category=cat,
                price_per_night=price,
                currency="INR",
                address=f"House {random.randint(10, 99)}, {loc['city']} Main Rd",
                city=loc["city"],
                state=loc["state"],
                country="India",
                lat=round(lat_jitter, 5),
                lng=round(lng_jitter, 5),
                max_guests=random.choice([2, 4, 6, 8]),
                bedrooms=random.choice([1, 2, 3, 4]),
                beds=random.choice([1, 2, 4, 5]),
                bathrooms=random.choice([1.0, 2.0, 3.5]),
                is_active=True
            )

            # Sample 4-7 amenities
            selected_amenities = random.sample(db_amenities, k=random.randint(4, 7))
            listing.amenities = selected_amenities

            db.add(listing)
            db.flush()

            # Attach 4-5 photos
            photo_pool = PHOTO_POOLS[i % len(PHOTO_POOLS)]
            for idx, p_url in enumerate(photo_pool):
                db_photo = ListingPhoto(listing_id=listing.id, url=p_url, sort_order=idx)
                db.add(db_photo)

            db_listings.append(listing)

        db.commit()

        # 4. Create Historical & Upcoming Bookings
        today = date.today()
        bookings_list = []

        # Upcoming confirmed bookings (block calendar dates for listings)
        for idx, listing in enumerate(db_listings[:8]):
            guest = guests[idx % len(guests)]
            start = today + timedelta(days=random.randint(2, 10))
            end = start + timedelta(days=random.randint(3, 7))
            nights = (end - start).days
            subtotal = listing.price_per_night * nights
            clean = max(500, int(subtotal * 0.08))
            srv = max(700, int(subtotal * 0.12))

            b = Booking(
                listing_id=listing.id,
                guest_id=guest.id,
                check_in=start,
                check_out=end,
                guests_count=min(2, listing.max_guests),
                nightly_rate_snapshot=listing.price_per_night,
                nights=nights,
                subtotal=subtotal,
                cleaning_fee=clean,
                service_fee=srv,
                total_price=subtotal + clean + srv,
                status="confirmed"
            )
            db.add(b)
            bookings_list.append(b)

        # Historical completed & cancelled bookings
        for idx, listing in enumerate(db_listings):
            guest = guests[(idx + 1) % len(guests)]
            if guest.id == listing.host_id:
                continue

            days_ago = random.randint(15, 90)
            start = today - timedelta(days=days_ago)
            end = start + timedelta(days=random.randint(2, 5))
            nights = (end - start).days
            subtotal = listing.price_per_night * nights
            clean = max(500, int(subtotal * 0.08))
            srv = max(700, int(subtotal * 0.12))
            st = "completed" if random.random() > 0.15 else "cancelled"

            b = Booking(
                listing_id=listing.id,
                guest_id=guest.id,
                check_in=start,
                check_out=end,
                guests_count=min(2, listing.max_guests),
                nightly_rate_snapshot=listing.price_per_night,
                nights=nights,
                subtotal=subtotal,
                cleaning_fee=clean,
                service_fee=srv,
                total_price=subtotal + clean + srv,
                status=st
            )
            db.add(b)
            bookings_list.append(b)

        db.commit()

        # 5. Create Reviews for Completed Bookings
        completed_bookings = [b for b in bookings_list if b.status == "completed"]
        for b in completed_bookings[:20]:
            r_rating = random.choice([4.8, 5.0, 4.9, 4.7, 5.0, 4.5])
            rev = Review(
                booking_id=b.id,
                listing_id=b.listing_id,
                reviewer_id=b.guest_id,
                rating=r_rating,
                cleanliness_rating=5.0 if r_rating >= 4.8 else 4.5,
                accuracy_rating=5.0,
                checkin_rating=5.0,
                value_rating=4.8 if r_rating >= 4.8 else 4.0,
                comment=random.choice(REVIEW_COMMENTS)
            )
            db.add(rev)

        # 6. Add some Wishlists
        for g in guests:
            sample_listings = random.sample(db_listings, k=3)
            for sl in sample_listings:
                w = Wishlist(user_id=g.id, listing_id=sl.id)
                db.add(w)

        db.commit()
        print("SUCCESS: Database successfully seeded!")
        print("--------------------------------------------------")
        print("Demo Credentials:")
        print("  - Both Roles : demo.both@airbnb.clone  / password123")
        print("  - Guest Only : demo.guest@airbnb.clone / password123")
        print("  - Host Only  : demo.host@airbnb.clone  / password123")
        print(f"Total Listings : {len(db_listings)}")
        print(f"Total Bookings : {len(bookings_list)}")
        print("--------------------------------------------------")

    except Exception as e:
        db.rollback()
        print(f"ERROR seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
