import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
from sklearn.calibration import CalibratedClassifierCV

data=pd.read_csv('processed.cleveland.data')

columns = [
    "age", "sex", "cp", "trestbps", "chol",
    "fbs", "restecg", "thalach", "exang",
    "oldpeak", "slope", "ca", "thal", "target"
]

data = pd.read_csv("processed.cleveland.data", header=None, names=columns)
data.replace("?",np.nan,inplace=True)

for col in columns:
    data[col]=pd.to_numeric(data[col], errors="coerce")
data.fillna(data.median(numeric_only=True),inplace=True)
data['target']=data['target'].apply(lambda X: 1 if X>0 else 0)
#model training
features=["age", "sex", "cp", "trestbps", "chol", "thalach", "oldpeak"]
X=data[features]
y=data['target']

#scaler 
scaler=StandardScaler()
X_scaler=scaler.fit_transform(X)

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
print(acc)

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
input_scaled=scaler.transform(input_feature)

input_pred=model.predict(input_scaled)[0]
probability=model.predict_proba(input_scaled)[0][1]
print(f'{probability*100:.2f}')
# print(data)


