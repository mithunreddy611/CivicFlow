ROUTING_RULES = {
    "POTHOLE": "Road Maintenance",
    "ROAD_DAMAGE": "Road Maintenance",
    "STREETLIGHT": "Electrical Department",
    "GARBAGE": "Waste Management",
    "WATER_LEAKAGE": "Water Department",
}


def get_department_name(category: str) -> str:
    category = category.upper().strip()

    if category not in ROUTING_RULES:
        raise ValueError(
            f"Unsupported issue category: {category}"
        )

    return ROUTING_RULES[category]