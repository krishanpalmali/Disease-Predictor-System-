# 🩺  Disease Prediction System

A web-based health prediction system that predicts the **risk of Diabetes and Heart Disease** using user health data.  
The project combines **Frontend (HTML, CSS, JavaScript)** and **Backend (Python + ML Libraries)** to deliver accurate health predictions.

---

## 🚀 Project Overview

This project is designed to help users get an early prediction of:
- **Diabetes**
- **Heart Disease**

Users enter basic health details through a web interface, and the system predicts the possibility of disease using trained machine learning models.

---

## 🛠️ Technologies Used

### Frontend
- HTML  
- CSS  
- JavaScript  

### Backend
- Python  

### Python Libraries
- NumPy  
- Pandas  
- Scikit-learn  
- Flask (for backend integration)  
- Pickle / Joblib (for model loading)

---

## ⚙️ Features

- User-friendly web interface  
- Real-time disease prediction  
- Separate prediction models for:
  - Diabetes
  - Heart Disease
- Machine Learning based prediction  
- Fast and accurate results  

---

## Confusion metrics, Accuracy Score and Classification Report 

-- Heart Disease Model's 
Model accuracy for heart Disease: 81.97%

Confusion metrics -- 
[[24  9]
 [ 2 26]]

 Classsification Report ---
                 precision    recall  f1-score   support

           0       0.92      0.73      0.81        33
           1       0.74      0.93      0.83        28

    accuracy                           0.82        61
   macro avg       0.83      0.83      0.82        61
weighted avg       0.84      0.82      0.82        61



-- Diabetes Model's 
Accuracy of this model : 78.79
Classification Report --
               precision    recall  f1-score   support

           0       0.84      0.82      0.83       147
           1       0.70      0.73      0.71        84

    accuracy                           0.79       231
   macro avg       0.77      0.77      0.77       231
weighted avg       0.79      0.79      0.79       231


Confusion matrix --
 [[121  26]
 [ 23  61]]

