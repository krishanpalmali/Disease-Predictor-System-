// Revised, working JS with proper initialization and DOM safety

let step = 0;
const userInfo = {};
let diseaseType = ""; 

// Ensure JS runs after DOM loads
window.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById("chat-box");
    const sendBtn = document.getElementById("send-btn");
    const input = document.getElementById("user-input");
    const clearBtn = document.getElementById("clear-btn");

    if (!chatBox || !sendBtn || !input || !clearBtn) {
        console.error("❌ Required HTML elements missing.");
        return;
    }

    addMessage("bot", "Namaste! Aap kaun sa prediction chahte hain? ❤️ Heart ya 🍬 Diabetes?");
    step = -1;

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    clearBtn.addEventListener('click', () => {
        chatBox.innerHTML = "";
        step = 0;
        addMessage("bot", "Namaste! Aapka naam kya hai?");
    });
});

function addMessage(type, text) {
    const box = document.getElementById("chat-box");
    const div = document.createElement('div');
    div.className = type;
    div.innerText = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function sendMessage() {
    const inp = document.getElementById("user-input");
    const txt = inp.value.trim();
    if (!txt) return;

    addMessage("user", txt);
    inp.value = "";
    handleUserInput(txt);
}

function handleUserInput(msg) {

    // STEP -1 → Ask which disease the user wants to check
    if (step === -1) {
        const input = msg.toLowerCase();

        if (input.includes("diabetes")) {
            diseaseType = "diabetes";
            addMessage("bot", "Aapka naam kya hai?");
            step = 0;
            return;
        }

        if (input.includes("heart")) {
            diseaseType = "heart";
            addMessage("bot", "Aapka naam kya hai?");
            step = 0;
            return;
        }

        addMessage("bot", "Please 'Heart' ya 'Diabetes' likhiye.");
        return;
    }

    switch (step) {

        /* ---------------------- COMMON QUESTIONS ---------------------- */

        // Step 0 → Ask for name
        case 0:
            userInfo.name = msg;
            addMessage("bot", `Hello ${msg}! 👋`);
            addMessage("bot", "Aapki age kya hai?");
            step = 1;
            break;

        // Step 1 → Ask for age
        case 1:
            userInfo.age = Number(msg);

            if (isNaN(userInfo.age)) {
                addMessage("bot", "Age number me bataye.");
                return;
            }

            // If disease type is diabetes → ask glucose
            if (diseaseType === "diabetes") {
                addMessage("bot", "Aapka glucose level kya hai?");
                step = 2;
            } 
            // If disease type is heart → ask CP
            else {
                addMessage("bot", "Aapka chest pain type (cp) bataye. (0–3)");
                step = 100;
            }
            break;




        /* ---------------------- DIABETES QUESTIONS ---------------------- */

        case 2:
            userInfo.glucose = Number(msg);
            if (isNaN(userInfo.glucose)) return addMessage("bot", "Numeric value bataye.");
            addMessage("bot", "BMI bataye");
            step = 3;
            break;

        case 3:
            userInfo.bmi = Number(msg);
            if (isNaN(userInfo.bmi)) return addMessage("bot", "Numeric value bataye.");
            addMessage("bot", "Blood Pressure bataye");
            step = 4;
            break;

        case 4:
            userInfo.bp = Number(msg);
            if (isNaN(userInfo.bp)) return addMessage("bot", "Numeric value bataye.");
            addMessage("bot", "Diabetes Pedigree Function (DPF) bataye");
            step = 5;
            break;

        case 5:
            userInfo.DPF = Number(msg);
            if (isNaN(userInfo.DPF)) return addMessage("bot", "Numeric value bataye.");

            addMessage("bot", "Diabetes data analyze ho raha hai... 🔍");
            runDiabetesPrediction();
            step = 10;
            break;




        /* ------------------------- HEART QUESTIONS ------------------------- */

        case 100:
            userInfo.cp = Number(msg);
            if (isNaN(userInfo.cp)) return addMessage("bot", "Numeric value bataye.");
            addMessage("bot", "Aapka normal BP (resting BP) kitna hota hai?");
            step = 101;
            break;

        case 101:
            userInfo.trestbps = Number(msg);
            if (isNaN(userInfo.trestbps)) return addMessage("bot", "Numeric value bataye.");
            addMessage("bot", "Cholesterol level bataye");
            step = 102;
            break;

        case 102:
            userInfo.chol = Number(msg);
            if (isNaN(userInfo.chol)) return addMessage("bot", "Numeric value bataye.");
            addMessage("bot", "Aapka highest heart rate kitna gaya tha?(exercise ke time)");
            step = 103;
            break;

        case 103:
            userInfo.thalach = Number(msg);
            if (isNaN(userInfo.thalach)) return addMessage("bot", "Numeric value bataye.");
            addMessage("bot", "Oldpeak(stress test report me 'ST depression') value bataye");
            step = 104;
            break;

        case 104:
            userInfo.oldpeak = Number(msg);
            if (isNaN(userInfo.oldpeak)) return addMessage("bot", "Numeric value bataye.");

            addMessage("bot", "Heart data analyze ho raha hai... ❤️🔍");
            runHeartPrediction();
            step = 10;
            break;




        /* --------------------------- FALLBACK --------------------------- */

        default:
            addMessage("bot", "Aapka data record ho chuka hai 😊");
    }
}


function runDiabetesPrediction() {
    const payload = {
    Glucose: userInfo.glucose,
    BloodPressure: userInfo.bp,
    BMI: userInfo.bmi,
    DiabetesPedigreeFunction: userInfo.DPF,
    Age: userInfo.age
    };
    fetch("http://localhost:8000/predict-diabetes", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => addMessage("bot", `📊 Diabetes Risk: ${data.risk.toFixed(2)}%`))
    .catch(err => addMessage("bot", "Backend error: " + err));
}

function runHeartPrediction() {
    const payload = {
        age: userInfo.age,
        sex: 1,  // you can add question later
        cp: userInfo.cp,
        trestbps: userInfo.trestbps,
        chol: userInfo.chol,
        thalach: userInfo.thalach,
        oldpeak: userInfo.oldpeak
    };

    fetch("http://localhost:8000/predict-heart", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => addMessage("bot", `❤️ Heart Disease Risk: ${data.risk.toFixed(2)}%`))
    .catch(err => addMessage("bot", "Backend error: " + err));
}

