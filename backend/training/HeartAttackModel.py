import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
from sklearn.calibration import CalibratedClassifierCV
import joblib

columns = [
    "age", "sex", "cp", "trestbps", "chol",
    "fbs", "restecg", "thalach", "exang",
    "oldpeak", "slope", "ca", "thal", "target"
]

data = pd.read_csv("backend/training/processed.cleveland.data", header=None, names=columns)
data.replace("?",np.nan,inplace=True)

for col in columns:
    data[col]=pd.to_numeric(data[col], errors="coerce")
data.fillna(data.median(numeric_only=True),inplace=True)
data['target']=data['target'].apply(lambda X: 1 if X>0 else 0)
#model training
features=["age", "sex", "cp", "trestbps", "chol", "thalach", "oldpeak"]
X=data[features]
y=data['target']

#scalar 
scalar=StandardScaler()
X_scaler=scalar.fit_transform(X)

X_train,X_test,Y_train,Y_test=train_test_split(X_scaler,y,test_size=0.2,random_state=60)


rf=RandomForestClassifier(n_estimators=250,
    max_depth=10,
    min_samples_split=5,
    min_samples_leaf=7,
    random_state=57
)
model = CalibratedClassifierCV(rf, cv=5)

model.fit(X_train,Y_train)
pred=model.predict(X_test)
acc=accuracy_score(pred,Y_test)
print(f'Model accuracy for heart Disease: {acc*100:.2f}')

print("enter values for checking heart health: ")
age=float(input('enter AGE: '))
sex=float(input("Enter gender : (1 for Male and 0 for Female): "))
cp=float(input("enter chest pain level : (0 to 3):"))
RestingBP=float(input("enter BP level while resting (mm hg):"))
cholestrol=float(input("enter cholestrol level (mg/dl):"))
maximumHR=float(input("maximum heart rate while excersice:"))
depression=float(input("How much the heart struggles during exercise. :"))

input_feature=pd.DataFrame([{
    "age":age, "sex":sex, "cp":cp, "trestbps":RestingBP, "chol":cholestrol, "thalach":maximumHR, "oldpeak":depression
}])
input_scaled=scalar.transform(input_feature)

input_pred=model.predict(input_scaled)[0]
probability=model.predict_proba(input_scaled)[0][1]
print(f'You have {probability*100:.2f} % chances of heart Desease, ')
probability=probability*100
if probability==0.0:
    print("Healthy heart, no worries")
elif probability<15.0 :
    print("No worries, very low risk ")
elif probability < 50.0 :
    print("moderate Risk, Borderline... You shoud take care of yourself")
elif probability<70.0:
    print("High risk of heart Disease..")
elif probability>70.0:
    print("very high risk of Heart Disease, ")
# print(data)


joblib.dump(model, "backend/models/heart_model.joblib")
joblib.dump(scalar, "backend/models/heart_scaler.joblib")
