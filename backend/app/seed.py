from app.database import SessionLocal
from app.models import User, Department, Officer
from app.utils.auth import hash_password


def seed_database():
    db = SessionLocal()

    try:
        # Check whether data already exists
        if db.query(Department).first():
            print("Database already contains seed data.")
            return

        # -------------------------
        # Departments
        # -------------------------

        road = Department(name="Road Maintenance")
        electrical = Department(name="Electrical Department")
        waste = Department(name="Waste Management")
        water = Department(name="Water Department")

        db.add_all([
            road,
            electrical,
            waste,
            water,
        ])

        db.commit()

        # -------------------------
        # Users
        # -------------------------

        citizen = User(
            name="Test Citizen",
            email="citizen@civicflow.com",
            password_hash=hash_password("citizen123"),
            role="CITIZEN",
        )

        admin = User(
            name="System Admin",
            email="admin@civicflow.com",
            password_hash=hash_password("admin123"),
            role="ADMIN",
        )

        arjun_user = User(
            name="Arjun",
            email="arjun@civicflow.com",
            password_hash=hash_password("arjun123"),
            role="OFFICER",
        )

        priya_user = User(
            name="Priya",
            email="priya@civicflow.com",
            password_hash=hash_password("priya123"),
            role="OFFICER",
        )

        ravi_user = User(
            name="Ravi",
            email="ravi@civicflow.com",
            password_hash=hash_password("ravi123"),
            role="OFFICER",
        )

        ananya_user = User(
            name="Ananya",
            email="ananya@civicflow.com",
            password_hash=hash_password("ananya123"),
            role="OFFICER",
        )

        db.add_all([
            citizen,
            admin,
            arjun_user,
            priya_user,
            ravi_user,
            ananya_user,
        ])

        db.commit()

        # -------------------------
        # Officers
        # -------------------------

        officers = [
            Officer(
                user_id=arjun_user.id,
                department_id=road.id,
                active_issue_count=0,
                is_available=True,
            ),
            Officer(
                user_id=priya_user.id,
                department_id=electrical.id,
                active_issue_count=0,
                is_available=True,
            ),
            Officer(
                user_id=ravi_user.id,
                department_id=waste.id,
                active_issue_count=0,
                is_available=True,
            ),
            Officer(
                user_id=ananya_user.id,
                department_id=water.id,
                active_issue_count=0,
                is_available=True,
            ),
        ]

        db.add_all(officers)
        db.commit()

        print("CivicFlow seed data created successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()