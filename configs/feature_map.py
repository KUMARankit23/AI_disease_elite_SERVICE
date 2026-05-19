FEATURE_MAP = {
    "diabetes": {
        "target": "Outcome",
        "features": ["Pregnancies","Glucose","BloodPressure","SkinThickness",
                     "Insulin","BMI","DiabetesPedigreeFunction","Age"]
    },
    "heart": {
        "target": "target",
        "features": ["age","sex","cp","trestbps","chol","fbs",
                     "restecg","thalach","exang","oldpeak","slope","ca","thal"]
    },
    "kidney": {
        "target": "classification",
        "features": ["age","bp","sg","al","su","bgr","bu","sc",
                     "sod","pot","hemo","pcv","wc","rc"]
    },
    "liver": {
        "target": "Dataset",
        "features": ["Age","Total_Bilirubin","Direct_Bilirubin",
                     "Alkaline_Phosphotase","Alamine_Aminotransferase",
                     "Aspartate_Aminotransferase","Total_Protiens",
                     "Albumin","Albumin_and_Globulin_Ratio"]
    }
}