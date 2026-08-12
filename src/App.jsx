import React from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import SemesterCard from "./components/SemesterCard";
import html2pdf from "html2pdf.js"; // Importing the PDF library
import { Download } from "lucide-react"; // Importing a download icon
import "./App.css";

function App() {
  const [data, setData] = useLocalStorage("cgpa-data", {
    gradingScale: 5.0,
    semesters: [],
  });

  const addSemester = () => {
    const newSemester = {
      id: Date.now(),
      title: `Semester ${data.semesters.length + 1}`,
      courses: [],
    };
    setData({ ...data, semesters: [...data.semesters, newSemester] });
  };

  const updateSemester = (semesterId, updatedSemesterData) => {
    const newSemesters = data.semesters.map((s) =>
      s.id === semesterId ? updatedSemesterData : s,
    );
    setData({ ...data, semesters: newSemesters });
  };

  const deleteSemester = (semesterId) => {
    const newSemesters = data.semesters.filter((s) => s.id !== semesterId);
    setData({ ...data, semesters: newSemesters });
  };

  // --- GLOBAL CGPA MATH ENGINE ---
  const calculateCGPA = () => {
    let globalUnits = 0;
    let globalPoints = 0;

    data.semesters.forEach((semester) => {
      semester.courses.forEach((course) => {
        if (course.grade && course.unit) {
          const unit = Number(course.unit);
          let point = 0;

          if (course.grade === "A") point = data.gradingScale;
          else if (course.grade === "B") point = data.gradingScale - 1;
          else if (course.grade === "C") point = data.gradingScale - 2;
          else if (course.grade === "D") point = data.gradingScale - 3;
          else if (course.grade === "E")
            point = Math.max(data.gradingScale - 4, 0);
          else if (course.grade === "F") point = 0;

          globalUnits += unit;
          globalPoints += point * unit;
        }
      });
    });

    if (globalUnits === 0) return { cgpa: "0.00", totalUnits: 0 };
    return {
      cgpa: (globalPoints / globalUnits).toFixed(2),
      totalUnits: globalUnits,
    };
  };

  const globalData = calculateCGPA();

  // --- PDF EXPORT FUNCTION ---
  const downloadTranscript = () => {
    const element = document.getElementById("transcript-area");
    const opt = {
      margin: 0.5,
      filename: "My_Academic_Transcript.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    // Temporarily hide UI elements we don't want in the PDF
    element.classList.add("exporting-pdf");
    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        element.classList.remove("exporting-pdf");
      });
  };

  return (
    <div className="app-wrapper">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <div className="app-container">
        <header className="premium-header fade-in">
          <div className="logo-section">
            <div className="logo-icon">🎓</div>
            <h1>
              Universal <span className="text-gradient">CGPA</span>
            </h1>
          </div>

          <div className="scale-selector">
            <label>Scale System</label>
            <select
              value={data.gradingScale}
              onChange={(e) =>
                setData({ ...data, gradingScale: Number(e.target.value) })
              }
            >
              <option value={7.0}>7.0 Point</option>
              <option value={5.0}>5.0 Point</option>
              <option value={4.0}>4.0 Point</option>
            </select>
          </div>
        </header>

        <main className="dashboard slide-up">
          {/* --- WE WRAP EVERYTHING IN THE EXPORT ID HERE --- */}
          <div id="transcript-area" className="export-wrapper">
            {/* --- GLOBAL SUMMARY CARD --- */}
            <div className="global-summary-card">
              <div className="summary-stats">
                <div className="stat-box">
                  <span className="stat-label">Cumulative GPA</span>
                  <span className="stat-value text-gradient">
                    {globalData.cgpa}
                  </span>
                </div>
                <div className="stat-box divider">
                  <span className="stat-label">Total Units</span>
                  <span className="stat-value">{globalData.totalUnits}</span>
                </div>
              </div>
              {/* Download button removed from here and moved to bottom */}
            </div>

            {/* --- SEMESTERS LIST --- */}
            {data.semesters.length === 0 ? (
              <div className="empty-state">
                <p>Your record is empty. Let's get started.</p>
              </div>
            ) : (
              <div className="semesters-container">
                {data.semesters.map((semester) => (
                  <SemesterCard
                    key={semester.id}
                    semester={semester}
                    updateSemester={updateSemester}
                    deleteSemester={deleteSemester}
                    gradingScale={data.gradingScale}
                  />
                ))}
              </div>
            )}
          </div>
          {/* --- END OF EXPORT WRAPPER --- */}

          {/* --- BOTTOM ACTION BUTTONS --- */}
          <div className="bottom-action-buttons">
            <button onClick={addSemester} className="premium-btn pulse-hover">
              <span className="btn-icon">+</span> Add New Semester
            </button>

            {data.semesters.length > 0 && (
              <button className="download-btn" onClick={downloadTranscript}>
                <Download size={18} /> Export PDF
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
