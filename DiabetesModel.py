
#import libraries 
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
from sklearn.calibration import CalibratedClassifierCV
from sklearn.preprocessing import StandardScaler
#accessing data 
data = pd.read_csv('diabetes.csv')


X=data[['Glucose','BloodPressure','BMI','DiabetesPedigreeFunction','Age']]
y=data['Outcome']


#scaler transform
scaler=StandardScaler()
X_scaled=scaler.fit_transform(X)

#train model and fit features inside model 
X_train,X_test,Y_train,Y_test=train_test_split(X_scaled,y, test_size=0.5, random_state=60)
rf=RandomForestClassifier()
model = CalibratedClassifierCV(rf, cv=5)
model.fit(X_train,Y_train)

 

#predicting model accuracy 
predict=model.predict(X_test)
accuracy=accuracy_score(Y_test,predict)
print(f'Accuracy of this model : {accuracy*100:.2f}')

#taking user input for diabetes checking
print('Enter given Details below : ')
Glucose = float(input("Enter Glucose level: "))
BloodPressure = float(input("Enter Blood Pressure: "))
BMI = float(input("Enter BMI: "))
DiabetesPedigreeFunction = float(input("Enter Diabetes Pedigree Function: "))
Age = float(input("Enter Age: "))

## creating a new data frame with user input which is useful for predicting diabetes 
input= pd.DataFrame([{
    'Glucose':Glucose,
    'BloodPressure':BloodPressure,
    'BMI':BMI,
    'DiabetesPedigreeFunction':DiabetesPedigreeFunction,
    'Age':Age
}])

input_scaled=scaler.transform(input)
#predicting user input using model 
probability=model.predict(input_scaled)[0]
probability_percentage=model.predict_proba(input_scaled)[0][1]

if probability==1:
    print(f'Likely to have diabetes, with a probability of {probability_percentage*100:.2f} %')
else:
    print(f'Likely not to have diabetes with a probability of {probability_percentage*100:.2f} %')

risk = probability_percentage  

if risk == 0.0:
    severity = 'Healthy person, no signs of diabetes.'
elif risk < 0.35:
    severity = "Early borderline signs but not dangerous."
elif risk < 0.60:
    severity = "Moderate risk, chances are increasing."
elif risk < 0.80:
    severity = "high chance of diabetes."
else:
    severity = "Critical Risk"

print(f"Severity Level: {severity}")



joblib.dump(model, 'diabetes_model.joblib')


