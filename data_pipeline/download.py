import os
import pandas as pd
import requests

os.makedirs("data/raw", exist_ok=True)

DATASETS = {
    "diabetes": {
        "url": "https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.csv",
        "columns": ["Pregnancies","Glucose","BloodPressure","SkinThickness",
                    "Insulin","BMI","DiabetesPedigreeFunction","Age","Outcome"]
    },

    "heart": {
        "url": "https://raw.githubusercontent.com/plotly/datasets/master/heart.csv",
        "columns": None
    },

    # ⚠️ FIXED WORKING LINKS
    "kidney": {
        "url": "https://raw.githubusercontent.com/epfml/ML_course/master/labs/ex11/template/data/kidney_disease.csv",
        "columns": None
    },

    "liver": {
        "url": "https://raw.githubusercontent.com/rahulrajpl/Indian-Liver-Patient-Dataset/master/ILPD.csv",
        "columns": None
    }
}

def download_file(url, path):
    response = requests.get(url, timeout=30)

    if response.status_code != 200:
        raise Exception(f"❌ Failed to download: {url}")

    # Write raw bytes — avoids any line-ending translation on Windows
    with open(path, "wb") as f:
        f.write(response.content)

def download():
    for name, info in DATASETS.items():
        print(f"\nDownloading {name}...")

        path = f"data/raw/{name}.csv"

        try:
            download_file(info["url"], path)

            df = pd.read_csv(path)

            # Fix diabetes headers
            if name == "diabetes":
                if len(df.columns) != len(info["columns"]):
                    df = pd.read_csv(path, header=None)
                    df.columns = info["columns"]

            # Clean column names
            df.columns = df.columns.str.strip()

            df.to_csv(path, index=False)

            print(f"✅ {name} ready")

        except Exception as e:
            print(f"❌ Error downloading {name}: {e}")

    print("\n🎉 All datasets processed!")

if __name__ == "__main__":
    download()