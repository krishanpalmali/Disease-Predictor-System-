
#import libraries 
import pandas as pd
from sklearn.model_selection import train_test_split,GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import joblib
from sklearn.calibration import CalibratedClassifierCV
from sklearn.preprocessing import StandardScaler
#accessing data 
data = pd.read_csv("backend/training/diabetes.csv")

data.loc[
    (data['Glucose'] > 180) &
    (data['BloodPressure'] > 110) &
    (data['BMI'] > 40) &
    (data['DiabetesPedigreeFunction'] > 1.1),
    'Outcome'
] = 1


X=data[['Glucose','BloodPressure','BMI','DiabetesPedigreeFunction','Age']]
y=data['Outcome']

#scalar transform
scalar=StandardScaler()
X_scaled=scalar.fit_transform(X)

#train model and fit features inside model 
X_train,X_test,Y_train,Y_test=train_test_split(X_scaled,y, test_size=0.3, random_state=60)
rf=RandomForestClassifier(random_state=42, class_weight='balanced', max_depth= 10, max_features= 'sqrt', min_samples_leaf= 2, min_samples_split= 5, n_estimators= 300)


model = CalibratedClassifierCV(rf, cv=5)
model.fit(X_train,Y_train)
THRESHOLD = 0.44

y_probs = model.predict_proba(X_test)[:, 1]
y_pred = (y_probs >= THRESHOLD).astype(int)



# #predicting model accuracy 

accuracy=accuracy_score(Y_test,y_pred)
print(f'Accuracy of this model : {accuracy*100:.2f}')
print('Classification Report -- \n',classification_report(Y_test,y_pred))
print('\nConfusion matrix -- \n',confusion_matrix(Y_test,y_pred))


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

input_scaled=scalar.transform(input)
#predicting user input using model 
probability=model.predict(input_scaled)[0]
probability_percentage=model.predict_proba(input_scaled)[0][1]

if probability==1:
    print(f'Likely to have diabetes, with a probability of {probability_percentage*100:.2f} %')
else:
    print(f'Likely not to have diabetes with a probability of {probability_percentage*100:.2f} %')

risk = probability_percentage  

if risk < 10.0:
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



joblib.dump(model, "backend/models/diabetes_model.joblib")
joblib.dump(scalar, "backend/models/diabetes_scaler.joblib")
