
import pandas as pd


def get_trends(site_id="S1", role="health_officer"):
    """
    Returns synthetic weekly occupational health surveillance data.
    All observations are aggregated, not individual worker records.
    """

    data = {
        "week": [f"W{i}" for i in range(1, 13)],
        "clinic_visits": [12, 13, 14, 13, 15, 16, 18, 21, 24, 27, 29, 32],
        "sickness_absence": [8, 9, 8, 10, 10, 11, 12, 13, 15, 16, 18, 20],
        "environment": [20, 21, 22, 21, 23, 25, 27, 29, 31, 34, 36, 39],
    }

    return pd.DataFrame(data).to_dict(orient="records")
