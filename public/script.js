// Chat + Voice Frontend
const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const micBtn = document.getElementById("mic-btn");
const clearBtn = document.getElementById("clear-btn");

let step = 0;
let userData = {}; // store name, age, glucose, bmi...
let recognizing = false;
let recognition = null;

// Init speech recognition if available
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'hi-IN'; // Hindi (India). Change to 'en-US' for English
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    recognizing = true;
    micBtn.textContent = '⏺️';
    micBtn.title = 'Recording... Click to stop';
  };

  recognition.onend = () => {
    recognizing = false;
    micBtn.textContent = '🎤';
    micBtn.title = 'Speak / Dictate';
  };

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    addMessage('user', text);
    handleChat(text);
  };

  recognition.onerror = (e) => {
    console.error("SpeechRecognition error", e);
    addMessage('bot', 'Mic error: ' + (e.error || 'unknown'));
  };
} else {
  micBtn.disabled = true;
  micBtn.title = "SpeechRecognition not supported in this browser";
}

// initial bot messages
addMessage('bot', "Namaste! Main aapka Diabetes Voice Assistant hoon. 😊\nAapka naam kya hai?");

sendBtn.addEventListener('click', () => {
  const text = input.value.trim();
  if (!text) return;
  addMessage('user', text);
  input.value = '';
  handleChat(text);
});

clearBtn.addEventListener('click', () => {
  chatBox.innerHTML = '';
  step = 0;
  userData = {};
  addMessage('bot', "Namaste! Main aapka Diabetes Voice Assistant hoon. 😊\nAapka naam kya hai?");
});

micBtn.addEventListener('click', () => {
  if (!recognition) {
    addMessage('bot', 'Aapka browser voice recognition support nahi karta. Chrome/Edge try karein.');
    return;
  }
  if (recognizing) {
    recognition.stop();
  } else {
    recognition.start();
  }
});

function addMessage(sender, text) {
  const el = document.createElement('div');
  el.className = sender;
  el.innerText = text;
  chatBox.appendChild(el);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function handleChat(msg) {
  // keep it simple: ask name -> age -> glucose -> bmi -> show meds and optional backend call
  const qAge = "Aapki age kitni hai?";
  const qGlucose = "Aapka fasting glucose level (mg/dL) kya hai?";
  const qBMI = "Aapka BMI kya hai? (agar pata ho)";

  if (step === 0) {
    userData.name = msg;
    addMessage('bot', qAge);
  } else if (step === 1) {
    userData.age = sanitizeNumber(msg);
    addMessage('bot', qGlucose);
  } else if (step === 2) {
    userData.glucose = sanitizeNumber(msg);
    addMessage('bot', qBMI);
  } else if (step === 3) {
    userData.bmi = sanitizeNumber(msg);
    addMessage('bot', "Dhanyavaad — main aapke data ke aadhaar par jaldi se evaluation kar raha hoon... 🔍");
    evaluateAndShow();
  } else {
    // after evaluation, allow free chat: if user asks medicine or tips
    interpretFreeText(msg);
  }

  step++;
}

function sanitizeNumber(text){
  const n = parseFloat(text.replace(/[^\d.]/g,'')); // extract numbers
  return isNaN(n) ? null : n;
}

function evaluateAndShow(){
  const G = userData.glucose;
  const BMI = userData.bmi;
  const Age = userData.age;

  // simple client-side risk rules (not medical advice)
  let risk = 0;
  if (G !== null) {
    if (G >= 200) risk += 3;
    else if (G >= 140) risk += 2;
    else if (G >= 100) risk += 1;
  }
  if (BMI !== null) {
    if (BMI >= 35) risk += 3;
    else if (BMI >= 30) risk += 2;
    else if (BMI >= 25) risk += 1;
  }
  if (Age !== null && Age >= 45) risk += 1;

  if (risk >= 4) {
    addMessage('bot', "⚠️ High Risk: Diabetes ka chance zyada ho sakta hai. Doctor se consult karein.");
    showMedicines(true);
  } else if (risk >= 2) {
    addMessage('bot', "⚠️ Moderate Risk: lifestyle aur testing pe dhyaan dein.");
    showMedicines(false);
  } else {
    addMessage('bot', "✅ Low Risk (approx): Healthy lifestyle maintain karein. Agar symptoms ho to testing karwayein.");
    showMedicines(false);
  }

  // If your friend provides backend, you can POST data here:
  // Uncomment and change URL if backend ready.
  /*
  fetch('http://localhost:5000/predict', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      Pregnancies: 0,
      Glucose: userData.glucose,
      BloodPressure: 70,
      SkinThickness: 20,
      Insulin: 80,
      BMI: userData.bmi,
      DiabetesPedigreeFunction: 0.5,
      Age: userData.age
    })
  }).then(r=>r.json()).then(res=>{
    addMessage('bot', 'Backend result: ' + (res.result || JSON.stringify(res)));
  }).catch(e=>{
    console.warn('Backend error', e);
  });
  */
}

function showMedicines(isHighRisk){
  // NOTE: ye sirf common medicines ke naam hain. Doctor ki salah jaruri hai.
  const medsHigh = [
    "Metformin (common first-line)",
    "Glimepiride (sulfonylurea)",
    "Sitagliptin (Januvia)",
    "Dapagliflozin (SGLT2 inhibitor)",
    "Insulin (agar zarurat ho)"
  ];
  const medsLifestyle = [
    "Metformin (agar doctor prescribe kare)",
    "Lifestyle changes: diet, exercise",
    "Vitamins: Vitamin D agar deficiency ho (doctor check kare)",
    "Regular monitoring (HbA1c, fasting glucose)"
  ];

  if (isHighRisk) {
    addMessage('bot', "💊 Sambhavit dawaai (doctor se confirm kar ke lein):\n• " + medsHigh.join("\n• "));
  } else {
    addMessage('bot', "💡 Suggestions & possible medicines:\n• " + medsLifestyle.join("\n• "));
  }

  addMessage('bot', "📌 Note: Main doctor nahi hoon. Ye general information hai. Please medical professional se confirm karein.");
}

function interpretFreeText(msg){
  const lower = msg.toLowerCase();
  if (lower.includes('dawai') || lower.includes('medicine') || lower.includes('drug')) {
    addMessage('bot', "Aap kis tarah ki dawai dekhna chahte hain? (e.g., oral tablets, insulin, ya lifestyle suggestions)");
  } else if (lower.includes('diet') || lower.includes('khana')) {
    addMessage('bot', "Diet suggestions: low sugar, complex carbs, fiber-rich foods, portion control. Main ek detailed diet plan bhi de sakta hoon.");
  } else {
    addMessage('bot', "Maaf kijiye, main is sawal ka seedha jawab nahi de paaya. Aap 'dawai' ya 'diet' likh kar try karein.");
  }
}
