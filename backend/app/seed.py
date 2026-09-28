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
        def get_or_create_dept(name):
            d = db.query(Department).filter(Department.name == name).first()
            if not d:
                d = Department(name=name)
                db.add(d)
                db.commit()
                db.refresh(d)
            return d

        road = get_or_create_dept("Road Maintenance")
        electrical = get_or_create_dept("Electrical Department")
        waste = get_or_create_dept("Waste Management")
        water = get_or_create_dept("Water Department")

        # -------------------------
        # Users
        # -------------------------
        def get_or_create_user(name, email, password, role):
            u = db.query(User).filter(User.email == email).first()
            if not u:
                u = User(
                    name=name,
                    email=email,
                    password_hash=hash_password(password),
                    role=role,
                )
                db.add(u)
                db.commit()
                db.refresh(u)
            return u

        citizen = get_or_create_user("Test Citizen", "citizen@civicflow.com", "citizen123", "CITIZEN")
        admin = get_or_create_user("System Admin", "admin@civicflow.com", "admin123", "ADMIN")
        arjun_user = get_or_create_user("Arjun", "arjun@civicflow.com", "arjun123", "OFFICER")
        priya_user = get_or_create_user("Priya", "priya@civicflow.com", "priya123", "OFFICER")
        ravi_user = get_or_create_user("Ravi", "ravi@civicflow.com", "ravi123", "OFFICER")
        ananya_user = get_or_create_user("Ananya", "ananya@civicflow.com", "ananya123", "OFFICER")

        # -------------------------
        # Officers
        # -------------------------
        def get_or_create_officer(user_id, department_id):
            o = db.query(Officer).filter(Officer.user_id == user_id).first()
            if not o:
                o = Officer(
                    user_id=user_id,
                    department_id=department_id,
                    active_issue_count=0,
                    is_available=True,
                )
                db.add(o)
                db.commit()
                db.refresh(o)
            return o

        get_or_create_officer(arjun_user.id, road.id)
        get_or_create_officer(priya_user.id, electrical.id)
        get_or_create_officer(ravi_user.id, waste.id)
        get_or_create_officer(ananya_user.id, water.id)

        print("CivicFlow seed data created successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()