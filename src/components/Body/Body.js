import React, { useRef, useState } from "react";
import ReactToPrint from "react-to-print";
import { ArrowDown } from "react-feather";
import { ChromePicker } from "react-color";

import Editor from "../Editor/Editor";
import Resume from "../Resume/Resume";

import styles from "./Body.module.css";

function Body() {
  // Reference to Resume component for printing
  const resumeRef = useRef();

  // Selected color
  // User can change this to ANY color using the color picker
  const [activeColor, setActiveColor] = useState("#6c63ff");

  // Show/hide color picker
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Resume sections
  const sections = {
    basicInfo: "Basic Info",
    workExp: "Work Experience",
    skill: "skills",
    project: "Projects",
    education: "Education",
    achievement: "Achievements",
    summary: "Summary",
    other: "Other",
  };

  // Resume information
  const [resumeInformation, setResumeInformation] = useState({
    [sections.basicInfo]: {
      id: sections.basicInfo,
      sectionTitle: sections.basicInfo,
      detail: {},
    },

    [sections.workExp]: {
      id: sections.workExp,
      sectionTitle: sections.workExp,
      details: [],
    },

    [sections.skill]: {
      id: sections.skill,
      sectionTitle: sections.skill,
      details: [],
    },

    [sections.project]: {
      id: sections.project,
      sectionTitle: sections.project,
      details: [],
    },

    [sections.education]: {
      id: sections.education,
      sectionTitle: sections.education,
      details: [],
    },

    [sections.achievement]: {
      id: sections.achievement,
      sectionTitle: sections.achievement,
      points: [],
    },

    [sections.summary]: {
      id: sections.summary,
      sectionTitle: sections.summary,
      detail: "",
    },

    [sections.other]: {
      id: sections.other,
      sectionTitle: sections.other,
      detail: "",
    },
  });

  // Handle color change
  const handleColorChange = (color) => {
    setActiveColor(color.hex);
  };

  return (
    <div className={styles.container}>
      {/* Page Heading */}
      <p className={styles.heading}>Resume Builder</p>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        {/* COLOR PICKER */}
        <div className={styles.colorSection}>
          <button
            type="button"
            className={styles.colorButton}
            style={{
              backgroundColor: activeColor,
            }}
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Choose resume color">
            +
          </button>

          {/* Color Picker Popup */}
          {showColorPicker && (
            <div className={styles.colorPickerPopup}>
              <ChromePicker color={activeColor} onChange={handleColorChange} />

              {/* Selected HEX value */}
              <div className={styles.hexValue}>
                Hex: {activeColor.toUpperCase()}
              </div>

              {/* Done button */}
              <button
                type="button"
                className={styles.doneButton}
                onClick={() => setShowColorPicker(false)}>
                Done
              </button>
            </div>
          )}
        </div>

        {/* DOWNLOAD BUTTON */}
        <ReactToPrint
          trigger={() => (
            <button className={styles.downloadButton}>
              Download
              <ArrowDown size={18} />
            </button>
          )}
          content={() => resumeRef.current}
        />
      </div>

      {/* Main Section */}
      <div className={styles.main}>
        {/* Editor */}
        <Editor
          sections={sections}
          information={resumeInformation}
          setInformation={setResumeInformation}
        />

        {/* Resume Preview */}
        <Resume
          ref={resumeRef}
          sections={sections}
          information={resumeInformation}
          activeColor={activeColor}
        />
      </div>
    </div>
  );
}

export default Body;
