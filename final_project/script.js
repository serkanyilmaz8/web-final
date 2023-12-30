let lectures = []; // storage for lectures 
let students = []; // storege for students
//let currentLectureId = ''; // Global variable to store the current lecture ID


// this function adds lecture if the lecture doesn't exist, otherwise it select the lecture
// all process make via lecture id comparison
function addOrSelectLecture(lectureId, lectureName, gradingScale, credit) {
    let lecture = lectures.find(l => l.id === lectureId);

    if (!lecture) {
        // Add new lecture if it doesn't exist
        lecture = { id: lectureId, name: lectureName, students: [], gradingScale: gradingScale, credit:credit };
        lectures.push(lecture);
    } else {
        // If the lecture already exists and a new name and credit are provided, update 
        lecture.name = lectureName;
        lecture.credit = credit;

        temp = lecture;
        const index = lectures.indexOf(lecture)
        if (index > -1) { // only splice array when item is found
            lectures.splice(index, 1); // 2nd parameter means remove one item only
          }
        lectures.push(temp);
        // add updated lecture to lectures list
    }

    // Whether new or existing, display the specified lecture
    displayLatestLecture(lecture);
}

// this function adds new student if the student doesn't exist, otherwise it updates the student
// this existing checking making via student id comparison
function addOrEditStudent(studentId, studentName, midtermGrade, finalGrade, lectureId) {
    let score = calculateScore(midtermGrade, finalGrade);
    let lecture = lectures.find(l => l.id === lectureId);
    let grade = '';
    //console.log(lecture.name);

    // accessing lecture info
    if(lecture){
        grade = calculateGrade(score, lecture.gradingScale);
        console.log("grade" + grade);
    }

    // checking student existency
    let existingStudentIndex = students.findIndex(s => s.id === studentId);
    
    if (existingStudentIndex !== -1) {
        // Update existing student
        students[existingStudentIndex].midterm = midtermGrade;
        students[existingStudentIndex].final = finalGrade;
        students[existingStudentIndex].score = score;
        students[existingStudentIndex].studentLectures[lectureId] = grade;
    } else {
        // Add new student
        let studentLectures = {};
        studentLectures[lectureId] = grade;
        students.push({ id: studentId, name: studentName, midterm: midtermGrade, final: finalGrade, score: score, studentLectures: studentLectures});
    }
    

    // Enroll student in the latest lecture (if not already enrolled)
    if (lectures.length > 0) {
        let latestLecture = lectures[lectures.length - 1];
        if (!latestLecture.students.includes(studentId)) {
            latestLecture.students.push(studentId);
        }
    }

    // Find the currently selected lecture and add the student
    let selectedLecture = lectures.find(l => l.id === lectureId);
    if (selectedLecture && !selectedLecture.students.includes(studentId)) {
        selectedLecture.students.push(studentId);
    }
    
    displayLatestLecture(); // Refresh UI
}

// this function calculate final score according to midterm and final grades
function calculateScore(midterm, final) {
    return (midterm * 0.4) + (final * 0.6);
}

// this function displays the lecture which is selected or latest added
function displayLatestLecture() {
    if (lectures.length === 0) {
        return; // If there is no lecture finish the process
    }

    let latestLecture = lectures[lectures.length - 1];

    // getting input from HTML
    let headerArea = document.getElementById('latest-lecture-title');
    let displayArea = document.getElementById('latest-lecture-info');
    console.log("tip: " + typeof(latestLecture.id));
    
    // Lecture Header part 
    headerArea.innerHTML = `<h3>${latestLecture.id + ' ' + latestLecture.name + ' ' + latestLecture.credit + ' credits'}</h3>`;

    // Student header part
    let content = `<div class='lecture-header'>
                        <span>Student ID</span>
                        <span>Student Name</span>
                        <span>Midterm</span>
                        <span>Final</span>
                        <span>Grade</span>
                        <span>Status</span>
                        <span>Delete</span>
                    </div>`;


    let sumScore = 0;
    let failed = 0;
    let passed = 0;
    let avgScore = 0;

    // infos for every student
    latestLecture.students.forEach(studentId => {
        let student = students.find(s => s.id === studentId);
        if (student) {
            sumScore += student.score;
            let grade = calculateGrade(student.score, latestLecture.gradingScale);
            let statusSymbol = grade === 'F' ? '<span style="color: red;">●</span>' : '<span style="color: green;">●</span>';
            
            if(grade === 'F')
                failed += 1;
            else 
                passed += 1;
            
            content += `<div class='student-info'>
                            <span>${student.id}</span>
                            <span>${student.name}</span>
                            <span>${student.midterm}</span>
                            <span>${student.final}</span>
                            <span>${grade}</span>
                            <span>${statusSymbol}</span>
                            <span><button onclick="removeStudentFromLecture('${student.id}', '${latestLecture.id}')">Remove</button></span>
                        </div>`;
        }
    });

    avgScore = calculateAvgScore(sumScore, latestLecture.students.length);

    // Adding all content to display area
    content += `<div class='lecture-display'>
    <span>${"Average: " + avgScore}</span>
    <span>${"      Failed: " + failed}</span>
    <span>${"      Passed: " + passed}</span>
    
    </div>`;
    displayArea.innerHTML = content;
    
}

// this function calculates avrgage score
function calculateAvgScore(sum, numberOfStudents){
    return sum/numberOfStudents;
}

// this function calculates letter grade with final score and lecture grading scale
function calculateGrade(score, scale) {
    let grade = '';

    if (scale === '10') {
        // 10-Point Grading Scale
        if (score >= 90) grade = 'A';
        else if (score >= 80) grade = 'B';
        else if (score >= 70) grade = 'C';
        else if (score >= 60) grade = 'D';
        else grade = 'F';
    } else if (scale === '7') {
        // 7-Point Grading Scale
        if (score >= 93) grade = 'A';
        else if (score >= 86) grade = 'B';
        else if (score >= 79) grade = 'C';
        else if (score >= 72) grade = 'D';
        else grade = 'F';
    }

    return grade;
}

// this function searchs students by provided string
// it can be return all student infos which contain the provided string
function searchStudent(studentName) {
    // searching part
    let searchResults = students.filter(s => s.name.toLowerCase().includes(studentName.toLowerCase()));

    // connection dynamic HTML area
    let resultsArea = document.getElementById('search-results');
    resultsArea.innerHTML = '';

    // checks every student in search results
    searchResults.forEach(student => {
        let gpaSum = 0;
        let totalCredits = 0;
        console.log(student.studentLectures);
        resultsArea.innerHTML += `<h4>Student: ${student.name}</h4>`;
        resultsArea.innerHTML += `<div><strong>ID:</strong> ${student.id}</div>`;

        // calcuting grade and gpa and adding HMTL part
        for (let lectureId in student.studentLectures) {
            
            console.log("tip2" + typeof(lectureId)); // Debugging için lectureId'yi yazdır
            let lecture = lectures.find(l => l.id === Number(lectureId));
            console.log("Bulunan Lecture:", lecture); // Bulunan lecture'ı kontrol et

            // getting infos about all enrolled lectures
            if (lecture) {
                let grade = student.studentLectures[lectureId];
                let gradePoints = convertGradeToPoint(grade);
                gpaSum += gradePoints * lecture.credit;
                totalCredits += lecture.credit;

                resultsArea.innerHTML += `<div><strong>Lecture:</strong> ${lecture.name}, <strong>Grade:</strong> ${grade}</div>`;
            }
        }

        let gpa = totalCredits > 0 ? gpaSum / totalCredits : 0;
        
        // setting for most 2 floating point
        resultsArea.innerHTML += `<div><strong>GPA:</strong> ${gpa.toFixed(2)}</div>`;
    });
}

// this function converts letter grades to 1, 2, 3, 4 for gpa calculation 
function convertGradeToPoint(grade) {
    switch (grade) {
        case 'A': return 4;
        case 'B': return 3;
        case 'C': return 2;
        case 'D': return 1;
        case 'F': return 0;
        default: return 0;
    }
}

// this funcion deletes student from the lecture and it
function removeStudentFromLecture(studentId, lectureId) {
    let lecture = lectures.find(l => l.id === lectureId);
    if (lecture) {
        lecture.students = lecture.students.filter(id => id !== studentId);
        
        displayLatestLecture(); // Refresh the lecture display
    }
}

// getting lecture specs from the HTML part
document.getElementById('lecture-form').addEventListener('submit', function(event) {
    event.preventDefault();
    let lectureId = parseInt(document.getElementById('lecture-id').value);
    let lectureName = document.getElementById('lecture-name').value || `Lecture ${lectureId}`;
    let gradingScale = document.getElementById('grading-scale').value;
    let credit = parseInt(document.getElementById('credit').value);

    // it send lecture's datas 
    addOrSelectLecture(lectureId, lectureName, gradingScale, credit);
});

// getting student infos from the HTML part
document.getElementById('student-form').addEventListener('submit', function(event) {
    event.preventDefault();
    let studentId = document.getElementById('student-id').value;

    // checking student id input entering
    if(studentId.length === 0){
        alert("You must enter student id");
        return; // stop submission
    }

    // check student id lenght
    if (studentId.length > 9) {
        alert("Student id cannot be more than 9-digit");
        return; // Form gönderimini durdur
    }

    let studentName = document.getElementById('student-name').value;

    // check student name lenght
    if (studentName.length > 17) {
        alert("Student name cannot be more than 17 character");
        return; // Form gönderimini durdur
    }
    let midtermGrade = parseFloat(document.getElementById('midterm-grade').value);
    let finalGrade = parseFloat(document.getElementById('final-grade').value);
    let lectureId = parseInt(document.getElementById('lecture-id1').value);

    // Calling the function about the adding or editting student
    addOrEditStudent(studentId, studentName, midtermGrade, finalGrade, lectureId);
});

// getting the student name from the HTML about the search
document.getElementById('search-form').addEventListener('submit', function(event) {
    event.preventDefault();
    let query = document.getElementById('search-query').value;

    // searching part
    searchStudent(query);
});


displayLatestLecture();
