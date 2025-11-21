from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models
diabetes_model = joblib.load("backend/models/diabetes_model.joblib")
diabetes_scaler = joblib.load("backend/models/diabetes_scaler.joblib")
heart_model = joblib.load("backend/models/heart_model.joblib")
heart_scaler = joblib.load("backend/models/heart_scaler.joblib")


class DiabetesInput(BaseModel):
    Glucose: float
    BloodPressure: float
    SkinThickness: float
    Insulin: float
    BMI: float
    DiabetesPedigreeFunction: float
    Age: float


class HeartInput(BaseModel):
    age: float
    sex: float
    cp: float
    trestbps: float
    chol: float
    thalach: float
    oldpeak: float

@app.get("/")
def home():
    return {"message": "Heart & Diabetes Prediction API is running!"}

@app.post("/predict-diabetes")
def predict_diabetes(data: DiabetesInput):
    arr = np.array([[data.Glucose, data.BloodPressure,
                     data.SkinThickness, data.Insulin, data.BMI,
                     data.DiabetesPedigreeFunction, data.Age]])

    arr_scaled = diabetes_scaler.transform(arr)
    prob = diabetes_model.predict_proba(arr_scaled)[0][1] * 100

    return {"risk": prob}


@app.post("/predict-heart")
def predict_heart(data: HeartInput):
    arr = np.array([[data.age, data.sex, data.cp, data.trestbps,
                     data.chol, data.thalach, data.oldpeak]])

    arr_scaled = heart_scaler.transform(arr)
    prob = heart_model.predict_proba(arr_scaled)[0][1] * 100

    return {"risk": prob}
