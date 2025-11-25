from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
import os
app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

diabetes_model = joblib.load(os.path.join(MODEL_DIR, "diabetes_model.joblib"))
diabetes_scaler = joblib.load(os.path.join(MODEL_DIR, "diabetes_scaler.joblib"))
heart_model = joblib.load(os.path.join(MODEL_DIR, "heart_model.joblib"))
heart_scaler = joblib.load(os.path.join(MODEL_DIR, "heart_scaler.joblib"))
# Load models
# diabetes_model = joblib.load("models/diabetes_model.joblib")
# diabetes_scaler = joblib.load("models/diabetes_scaler.joblib")
# heart_model = joblib.load("models/heart_model.joblib")
# heart_scaler = joblib.load("models/heart_scaler.joblib")


class DiabetesInput(BaseModel):
    Glucose: float
    BloodPressure: float
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
    arr = np.array([[data.Glucose, data.BloodPressure, data.BMI,data.DiabetesPedigreeFunction, data.Age]])

    arr_scaled = diabetes_scaler.transform(arr)
    prob = diabetes_model.predict_proba(arr_scaled)[0][1] * 100

    if prob ==0:
        severity= "Healthy person, no signs of diabetes."
    elif prob < 10:
        severity = "Very low risk, no need to worry."
    elif prob < 35:
        severity = "Early borderline signs but not dangerous."
    elif prob < 60:
        severity = "Moderate risk, chances are increasing."
    elif prob < 80:
        severity = "High chance of diabetes."
    else:
        severity = "⚠️ Critical Risk! Immediate medical consultation recommended."

    return {"risk": prob,
            "severity":severity}


@app.post("/predict-heart")
def predict_heart(data: HeartInput):
    arr = np.array([[data.age, data.sex, data.cp, data.trestbps,
                     data.chol, data.thalach, data.oldpeak]])

    arr_scaled = heart_scaler.transform(arr)
    prob = heart_model.predict_proba(arr_scaled)[0][1] * 100

    if prob == 0:
        severity = "Healthy heart, no worries ❤️"
    elif prob < 15:
        severity = "No worries, very low risk."
    elif prob < 50:
        severity = "Moderate risk, borderline... Take care of yourself."
    elif prob < 70:
        severity = "High risk of heart disease."
    else:
        severity = "⚠️ Very high risk of heart disease!"
    return {"risk": prob,
            "severity":severity}
