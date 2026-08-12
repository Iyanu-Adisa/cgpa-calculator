import React from "react";
import { Trash2, Plus, X } from "lucide-react";

export default function SemesterCard({
  semester,
  updateSemester,
  deleteSemester,
  gradingScale,
}) {
  // Add a new blank course row
  const addCourse = () => {
    const newCourse = { id: Date.now(), code: "", unit: "", grade: "" };
    updateSemester(semester.id, {
      ...semester,
      courses: [...semester.courses, newCourse],
    });
  };

  // Update a specific field (code, unit, or grade) in a specific course
  const updateCourse = (courseId, field, value) => {
    const updatedCourses = semester.courses.map((course) =>
      course.id === courseId ? { ...course, [field]: value } : course,
    );
    updateSemester(semester.id, { ...semester, courses: updatedCourses });
  };

  // Remove a course row
  const removeCourse = (courseId) => {
    const updatedCourses = semester.courses.filter(
      (course) => course.id !== courseId,
    );
    updateSemester(semester.id, { ...semester, courses: updatedCourses });
  };

  // --- THE REAL-TIME MATH ENGINE ---
  const calculateGPA = () => {
    let totalUnits = 0;
    let totalQualityPoints = 0;

    semester.courses.forEach((course) => {
      if (course.grade && course.unit) {
        const unit = Number(course.unit);
        let point = 0;

        // Convert Letter Grade to Number based on the selected scale
        if (course.grade === "A") point = gradingScale;
        else if (course.grade === "B") point = gradingScale - 1;
        else if (course.grade === "C") point = gradingScale - 2;
        else if (course.grade === "D") point = gradingScale - 3;
        else if (course.grade === "E") point = Math.max(gradingScale - 4, 0);
        else if (course.grade === "F") point = 0;

        totalUnits += unit;
        totalQualityPoints += point * unit;
      }
    });

    if (totalUnits === 0) return "0.00";
    return (totalQualityPoints / totalUnits).toFixed(2);
  };

  return (
    <div className="semester-card fade-in">
      <div className="semester-header">
        <input
          type="text"
          className="semester-title-input"
          value={semester.title}
          onChange={(e) =>
            updateSemester(semester.id, { ...semester, title: e.target.value })
          }
        />
        <button
          className="delete-btn"
          title="Delete Semester"
          onClick={() => deleteSemester(semester.id)}
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="courses-container">
        {semester.courses.map((course) => (
          <div key={course.id} className="course-row">
            <input
              type="text"
              placeholder="Course Code (e.g. CSC101)"
              className="course-input code-input"
              value={course.code}
              onChange={(e) =>
                updateCourse(course.id, "code", e.target.value.toUpperCase())
              }
            />

            <select
              className="course-input"
              value={course.unit}
              onChange={(e) =>
                updateCourse(course.id, "unit", Number(e.target.value))
              }
            >
              <option value="">Unit</option>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>

            <select
              className="course-input"
              value={course.grade}
              onChange={(e) => updateCourse(course.id, "grade", e.target.value)}
            >
              <option value="">Grade</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
              <option value="F">F</option>
            </select>

            <button
              className="remove-course-btn"
              onClick={() => removeCourse(course.id)}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <button className="add-course-btn" onClick={addCourse}>
        <Plus size={16} /> Add Course
      </button>

      <div className="semester-footer">
        <span>
          Semester GPA:{" "}
          <strong className="gpa-highlight">{calculateGPA()}</strong>
        </span>
      </div>
    </div>
  );
}
