  // Initialize Firebase (use environment variables in production)
  const firebaseConfig = {
    apiKey: "AIzaSyCi7usXox721fWVLvSMBwOLf9OnQkIofAI", // Replace with process.env.FIREBASE_API_KEY in production
    authDomain: "student-app-c6abf.firebaseapp.com",
    projectId: "student-app-c6abf",
    storageBucket: "student-app-c6abf.appspot.com",
    messagingSenderId: "896987976968",
    appId: "1:896987976968:web:b9ab97e1ae698aff0688bd",
    measurementId: "G-BKHGSWQ3CN"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const messaging = firebase.messaging();

  /***************************************
   * Load Student Data from Firestore
   ***************************************/
  function loadStudentData(rollNo) {
    if (!rollNo) {
      alert("Please enter a valid Roll No.");
      return;
    }
    db.collection("students").doc(rollNo).get()
      .then(doc => {
        if (doc.exists) {
          const student = doc.data();
          displayStudentInfo(student);
          displaySubjectGrades(student.marks);
        } else {
          alert("Student record not found!");
        }
      })
      .catch(err => {
        console.error("Error fetching student data:", err);
        alert("Failed to load student data. Please try again.");
      });
  }

  /***************************************
   * Display Student Info on Page
   ***************************************/
  function displayStudentInfo(student) {
    document.getElementById("name").innerText = student.name || "N/A";
    document.getElementById("roll").innerText = student.roll || "N/A";
    document.getElementById("attendance").innerText = student.attendance || "N/A";
  }

  /***************************************
   * Display Grades
   ***************************************/
  function calculateGrade(mark) {
    if (mark >= 90) return "A+";
    if (mark >= 80) return "A";
    if (mark >= 70) return "B+";
    if (mark >= 60) return "B";
    if (mark >= 50) return "C";
    return "F";
  }

  function displaySubjectGrades(marks) {
    const gradesDiv = document.getElementById("grades");
    gradesDiv.innerHTML = "<h3>Subject Grades:</h3>";
    if (!marks) {
      gradesDiv.innerHTML += "<p>No grades available.</p>";
      return;
    }
    for (let subject in marks) {
      const grade = calculateGrade(marks[subject]);
      gradesDiv.innerHTML += `<p>${subject}: ${marks[subject]} (${grade})</p>`;
    }
  }

  /***************************************
   * Register Service Worker
   ***************************************/
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then(reg => {
        console.log("✅ Service Worker registered:", reg.scope);
      })
      .catch(err => {
        console.error("❌ Service Worker registration failed:", err);
      });
  }

  /***************************************
   * Push Notification Demo
   ***************************************/
  document.getElementById("notifyBtn").addEventListener("click", async () => {
    const message = document.getElementById("customMsg").value || "This is a test notification!";
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await messaging.getToken({
          vapidKey: "BMHCLuhDjzcIHnPj4NmyaCFax2ANhUkapZsh9z1anceBf60ieecRlP6QVTtv5uBHo5qP8_2uR5plZZBFmydebvs"
        });
        console.log("FCM Token:", token);

        // Simulate sending to backend (for demo, trigger locally)
        await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=BBdNVvoDS0h3J55n372NEo8rBOlOh0RHmMqL6v8PToy6Vi07MXEZ97KsWpMj1Nayc8tV2MHhTGEfzwl3w_a_8rs`, // Replace with Firebase Server Key
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: token,
            notification: {
              title: "📢 Student Alert",
              body: message,
              icon: "/icon.png"
            }
          })
        });

        document.getElementById("preview").innerText = `Notification Sent: "${message}"`;
      } else {
        alert("Please allow notifications to proceed.");
      }
    } catch (err) {
      console.error("Notification error:", err);
      alert("Failed to send notification.");
    }
  });

  /***************************************
   * PDF Report Card Generator
   ***************************************/
  document.getElementById("pdfBtn").addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const name = document.getElementById("name").innerText;
    const roll = document.getElementById("roll").innerText;
    const attendance = document.getElementById("attendance").innerText;
    const subjects = document.getElementById("grades").innerText.split("\n").filter(line => line.includes(":"));

    doc.setFontSize(20);
    doc.text("Student Report Card", 60, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${name}`, 20, 40);
    doc.text(`Roll No: ${roll}`, 20, 50);
    doc.text(`Attendance: ${attendance}`, 20, 60);
    doc.text("Subjects & Grades:", 20, 75);
    let y = 85;
    subjects.forEach(line => {
      doc.text(line, 20, y);
      y += 10;
    });

    doc.save(`${roll}_report_card.pdf`);
  });

  /***************************************
   * Admin Panel - Save Student to Firestore
   ***************************************/
  document.getElementById("savebtn").addEventListener("click", function () {
    const roll = document.getElementById("studentRoll").value;
    const name = document.getElementById("studentName").value;
    const attendance = document.getElementById("studentAttendance").value;
    const math = parseInt(document.getElementById("mathMarks").value) || 0;
    const science = parseInt(document.getElementById("scienceMarks").value) || 0;
    const english = parseInt(document.getElementById("englishMarks").value) || 0;
    const hindi = parseInt(document.getElementById("hindiMarks").value) || 0;

    if (!roll || !name || !attendance) {
      alert("Please fill in all required fields.");
      return;
    }

    db.collection("students").doc(roll).set({
      name,
      roll,
      attendance,
      marks: {
        Math: math,
        Science: science,
        English: english,
        Hindi: hindi
      }
    })
      .then(() => {
        alert("✅ Student data saved.");
        loadStudentData(roll); // Refresh data after saving
      })
      .catch(err => {
        console.error("Error saving data:", err);
        alert("❌ Error saving data: " + err.message);
      });
  });

  /***************************************
   * Initial Load
   ***************************************/
  document.addEventListener("DOMContentLoaded", () => {
    const rollNo = prompt("Enter Student Roll No (e.g., 12345, 12346):");
    if (rollNo) loadStudentData(rollNo);
  });
