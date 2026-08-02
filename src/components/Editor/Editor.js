import React, { useEffect, useState } from "react";
import { X, Upload, FileText, Download, Save } from "react-feather";
import toast from "react-hot-toast";

import InputControl from "../InputControl/InputControl";

import styles from "./Editor.module.css";

//localStorage key under which saved resume snapshots are stored
const SAVED_RESUMES_KEY = "resumeBuilder_savedResumes";

function Editor(props) {
  const sections = props.sections; // reciving data from parent component Editor and accesing the props from sections and storing in section varible
  const information = props.information;
  const setInformation = props.setInformation; //same

  //state which handles the active-section of the editor
  const [activeSectionKey, setActiveSectionKey] = useState(
    Object.keys(sections)[0],
  );

  //state that holds active sections and their values
  const [activeInformation, setActiveInformation] = useState(
    information[sections[Object.keys(sections)[0]]],
  );

  //state to handle index of the chips
  const [activeDetailIndex, setActiveDetailIndex] = useState(0);

  //state to handle and store the title of a section
  const [sectionTitle, setSectionTitle] = useState(
    sections[Object.keys(sections)[0]],
  );

  //state is used for adding new detail items in a section
  const [values, setValues] = useState({
    name: activeInformation?.detail?.name || "",
    title: activeInformation?.detail?.title || "",
    linkedin: activeInformation?.detail?.linkedin || "",
    github: activeInformation?.detail?.github || "",
    phone: activeInformation?.detail?.phone || "",
    email: activeInformation?.detail?.email || "",
    oldResumeFile: activeInformation?.detail?.data
      ? activeInformation.detail
      : null,
  });

  //state to hold any file-upload validation error message
  const [fileError, setFileError] = useState("");

  //max size (in bytes) allowed for the old resume upload
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  //formats a byte count into a readable KB/MB string
  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  //reads the selected file, validates it, and stores it (as base64) in values
  const handleOldResumeUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setFileError("Please upload a PDF or Word document (.pdf, .doc, .docx).");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError("That file is too large. Max size is 5MB.");
      event.target.value = "";
      return;
    }

    setFileError("");

    const reader = new FileReader();
    reader.onload = () => {
      setValues((prev) => ({
        ...prev,
        oldResumeFile: {
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result, // base64 data URL, used for download/preview
        },
      }));
    };
    reader.onerror = () => {
      setFileError("Something went wrong reading that file. Please try again.");
    };
    reader.readAsDataURL(file);

    // reset so re-selecting the same file after removing it still fires onChange
    event.target.value = "";
  };

  //clears the currently attached old resume file
  const handleRemoveOldResume = () => {
    setValues((prev) => ({ ...prev, oldResumeFile: null }));
    setFileError("");
  };

  //state holding the list of saved resume snapshots (loaded from localStorage)
  const [savedResumes, setSavedResumes] = useState([]);

  //load any previously saved resume snapshots once, on mount
  useEffect(() => {
    try {
      const existing = JSON.parse(
        localStorage.getItem(SAVED_RESUMES_KEY) || "[]",
      );
      setSavedResumes(existing);
    } catch (err) {
      setSavedResumes([]);
    }
  }, []);

  //formats an ISO date string for display
  const formatSavedDate = (isoString) => {
    try {
      return new Date(isoString).toLocaleString();
    } catch (err) {
      return "";
    }
  };

  //saves a full snapshot of the current resume (all sections) as a new entry
  const handleSaveResumeSnapshot = () => {
    try {
      const resumeName =
        information?.[sections.basicInfo]?.detail?.name || "Untitled Resume";

      const snapshot = {
        id: Date.now().toString(),
        name: resumeName,
        savedAt: new Date().toISOString(),
        data: information,
      };

      const existing = JSON.parse(
        localStorage.getItem(SAVED_RESUMES_KEY) || "[]",
      );
      const updated = [snapshot, ...existing];

      localStorage.setItem(SAVED_RESUMES_KEY, JSON.stringify(updated));
      setSavedResumes(updated);
      toast.success("Resume saved!");
    } catch (err) {
      toast.error("Couldn't save your resume. Please try again.");
    }
  };

  //restores a previously saved snapshot back into the editor
  const handleRestoreSnapshot = (snapshot) => {
    setInformation(snapshot.data);
    toast.success(`Loaded "${snapshot.name}"`);
  };

  //removes a saved snapshot from the list
  const handleDeleteSnapshot = (id) => {
    try {
      const updated = savedResumes.filter((snap) => snap.id !== id);
      localStorage.setItem(SAVED_RESUMES_KEY, JSON.stringify(updated));
      setSavedResumes(updated);
    } catch (err) {
      toast.error("Couldn't delete that saved version. Please try again.");
    }
  };

  //state handles for updating the point array by indexing and assigning the values
  const handlePointUpdate = (value, index) => {
    const tempValues = { ...values };
    if (!Array.isArray(tempValues.points)) tempValues.points = [];
    tempValues.points[index] = value;
    setValues(tempValues);
  };

  //creating the components for moving between sections
  const workExpBody = (
    <div className={styles.detail}>
      <div className={styles.row}>
        <InputControl
          label="Title"
          placeholder="Enter title eg. Frontend developer"
          value={values.title}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, title: event.target.value }))
          }
        />
        <InputControl
          label="Company Name"
          placeholder="Enter company name eg. amazon"
          value={values.companyName}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, companyName: event.target.value }))
          }
        />
      </div>
      <div className={styles.row}>
        <InputControl
          label="Certificate Link"
          placeholder="Enter certificate link"
          value={values.certificationLink}
          onChange={(event) =>
            setValues((prev) => ({
              ...prev,
              certificationLink: event.target.value,
            }))
          }
        />
        <InputControl
          label="Location"
          placeholder="Enter location eg. Remote"
          value={values.location}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, location: event.target.value }))
          }
        />
      </div>
      <div className={styles.row}>
        <InputControl
          label="Start Date"
          type="date"
          placeholder="Enter start date of work"
          value={values.startDate}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, startDate: event.target.value }))
          }
        />
        <InputControl
          label="End Date"
          type="date"
          placeholder="Enter end date of work"
          value={values.endDate}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, endDate: event.target.value }))
          }
        />
      </div>

      <div className={styles.column}>
        <label>Enter work description</label>
        <InputControl
          placeholder="Line 1"
          value={values.points ? values.points[0] : ""}
          onChange={(event) => handlePointUpdate(event.target.value, 0)}
        />
        <InputControl
          placeholder="Line 2"
          value={values.points ? values.points[1] : ""}
          onChange={(event) => handlePointUpdate(event.target.value, 1)}
        />
        <InputControl
          placeholder="Line 3"
          value={values.points ? values.points[2] : ""}
          onChange={(event) => handlePointUpdate(event.target.value, 2)}
        />
      </div>
    </div>
  );
  const skillsBody = (
    <div className={styles.detail}>
      <InputControl
        label="Skills"
        value={values.skill}
        placeholder="Add new skill"
        onChange={(event) =>
          setValues((prev) => ({ ...prev, skill: event.target.value }))
        }
      />
    </div>
  );
  const projectBody = (
    <div className={styles.detail}>
      <div className={styles.row}>
        <InputControl
          label="Title"
          value={values.title}
          placeholder="Enter title eg. Chat app"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, title: event.target.value }))
          }
        />
      </div>
      <InputControl
        label="Overview"
        value={values.overview}
        placeholder="Enter basic overview of project"
        onChange={(event) =>
          setValues((prev) => ({ ...prev, overview: event.target.value }))
        }
      />
      <div className={styles.row}>
        <InputControl
          label="Deployed Link"
          value={values.link}
          placeholder="Enter deployed link of project"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, link: event.target.value }))
          }
        />
        <InputControl
          label="Github Link"
          value={values.github}
          placeholder="Enter github link of project"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, github: event.target.value }))
          }
        />
      </div>
      <div className={styles.column}>
        <label>Enter project description</label>
        <InputControl
          placeholder="Line 1"
          value={values.points ? values.points[0] : ""}
          onChange={(event) => handlePointUpdate(event.target.value, 0)}
        />
        <InputControl
          placeholder="Line 2"
          value={values.points ? values.points[1] : ""}
          onChange={(event) => handlePointUpdate(event.target.value, 1)}
        />
        <InputControl
          placeholder="Line 3"
          value={values.points ? values.points[2] : ""}
          onChange={(event) => handlePointUpdate(event.target.value, 2)}
        />
        <InputControl
          placeholder="Line 4"
          value={values.points ? values.points[3] : ""}
          onChange={(event) => handlePointUpdate(event.target.value, 3)}
        />
      </div>
    </div>
  );

  const educationBody = (
    <div className={styles.detail}>
      <div className={styles.row}>
        <InputControl
          label="Title"
          value={values.title}
          placeholder="Enter title eg. B-tech"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, title: event.target.value }))
          }
        />
      </div>
      <InputControl
        label="College/School Name"
        value={values.college}
        placeholder="Enter name of your college/school"
        onChange={(event) =>
          setValues((prev) => ({ ...prev, college: event.target.value }))
        }
      />
      <div className={styles.row}>
        <InputControl
          label="Start Date"
          type="date"
          placeholder="Enter start date of this education"
          value={values.startDate}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, startDate: event.target.value }))
          }
        />
        <InputControl
          label="End Date"
          type="date"
          placeholder="Enter end date of this education"
          value={values.endDate}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, endDate: event.target.value }))
          }
        />
      </div>
    </div>
  );
  const basicInfoBody = (
    <div className={styles.detail}>
      <div className={styles.row}>
        <InputControl
          label="Name"
          placeholder="Enter your full name eg. Aashu"
          value={values.name}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, name: event.target.value }))
          }
        />
        <InputControl
          label="Title"
          value={values.title}
          placeholder="Enter your title eg. Frontend developer"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, title: event.target.value }))
          }
        />
      </div>
      <div className={styles.row}>
        <InputControl
          label="Linkedin Link"
          value={values.linkedin}
          placeholder="Enter your linkedin profile link"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, linkedin: event.target.value }))
          }
        />
        <InputControl
          label="Github Link"
          value={values.github}
          placeholder="Enter your github profile link"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, github: event.target.value }))
          }
        />
      </div>
      <div className={styles.row}>
        <InputControl
          label="Email"
          value={values.email}
          placeholder="Enter your email"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, email: event.target.value }))
          }
        />
        <InputControl
          label="Enter phone"
          value={values.phone}
          placeholder="Enter your phone number"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, phone: event.target.value }))
          }
        />
      </div>
    </div>
  );

  const achievementsBody = (
    <div className={styles.detail}>
      <div className={styles.column}>
        <label>List your achievements</label>
        <InputControl
          placeholder="Line 1"
          value={values.points ? values.points[0] : ""}
          onChange={(event) => handlePointUpdate(event.target.value, 0)}
        />
        <InputControl
          placeholder="Line 2"
          value={values.points ? values.points[1] : ""}
          onChange={(event) => handlePointUpdate(event.target.value, 1)}
        />
        <InputControl
          placeholder="Line 3"
          value={values.points ? values.points[2] : ""}
          onChange={(event) => handlePointUpdate(event.target.value, 2)}
        />
        <InputControl
          placeholder="Line 4"
          value={values.points ? values.points[3] : ""}
          onChange={(event) => handlePointUpdate(event.target.value, 3)}
        />
      </div>
    </div>
  );
  const summaryBody = (
    <div className={styles.detail}>
      <InputControl
        label="Summary"
        value={values.summary}
        placeholder="Enter your objective/summary"
        onChange={(event) =>
          setValues((prev) => ({ ...prev, summary: event.target.value }))
        }
      />
    </div>
  );
  const otherBody = (
    <div className={styles.detail}>
      <InputControl
        label="Other"
        value={values.other}
        placeholder="Enter something"
        onChange={(event) =>
          setValues((prev) => ({ ...prev, other: event.target.value }))
        }
      />
    </div>
  );

  const oldResumeBody = (
    <div className={styles.detail}>
      <div className={styles.column}>
        <label>
          Upload your old resume for reference (PDF or Word, max 5MB)
        </label>

        {values.oldResumeFile ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}>
            <FileText size={20} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                {values.oldResumeFile.name}
              </p>
              <span style={{ fontSize: "12px", color: "#888" }}>
                {formatFileSize(values.oldResumeFile.size)}
              </span>
            </div>
            <a
              href={values.oldResumeFile.data}
              download={values.oldResumeFile.name}
              title="Download"
              style={{ display: "flex", cursor: "pointer" }}>
              <Download size={18} />
            </a>
            <X
              style={{ cursor: "pointer" }}
              onClick={handleRemoveOldResume}
              title="Remove"
            />
          </div>
        ) : (
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "24px",
              border: "2px dashed #ccc",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#888",
            }}>
            <Upload size={20} />
            <span>Click to upload a file</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleOldResumeUpload}
              style={{ display: "none" }}
            />
          </label>
        )}

        {fileError ? (
          <p style={{ color: "#d33", fontSize: "13px", margin: 0 }}>
            {fileError}
          </p>
        ) : (
          ""
        )}
      </div>

      <div
        style={{
          marginTop: "24px",
          paddingTop: "20px",
          borderTop: "1px solid #eee",
        }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
          }}>
          <label style={{ margin: 0 }}>Saved versions of your resume</label>
          <button
            type="button"
            onClick={handleSaveResumeSnapshot}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
            }}>
            <Save size={16} />
            Save Resume
          </button>
        </div>

        {savedResumes.length === 0 ? (
          <p style={{ color: "#888", fontSize: "13px", marginTop: "10px" }}>
            No saved versions yet. Click "Save Resume" to keep a snapshot of
            your current resume that you can come back to later.
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginTop: "12px",
            }}>
            {savedResumes.map((snap) => (
              <div
                key={snap.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}>
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                    {snap.name}
                  </p>
                  <span style={{ fontSize: "12px", color: "#888" }}>
                    {formatSavedDate(snap.savedAt)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexShrink: 0,
                  }}>
                  <button
                    type="button"
                    onClick={() => handleRestoreSnapshot(snap)}
                    style={{ cursor: "pointer" }}>
                    Load
                  </button>
                  <X
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDeleteSnapshot(snap.id)}
                    title="Delete"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  //generateBody is a function that returns JSX for the active section based on activeSectionKey.
  const generateBody = () => {
    switch (sections[activeSectionKey]) {
      case sections.basicInfo:
        return basicInfoBody;
      case sections.workExp:
        return workExpBody;
      case sections.skill:
        return skillsBody;
      case sections.project:
        return projectBody;
      case sections.education:
        return educationBody;
      case sections.achievement:
        return achievementsBody;
      case sections.summary:
        return summaryBody;
      case sections.other:
        return otherBody;
      case sections.oldResume:
        return oldResumeBody;
      default:
        return null;
    }
  };

  //this function  will handle moving to next/previous section and updating activeSectionKey state accordingly.
  const handleSubmission = () => {
    switch (sections[activeSectionKey]) {
      case sections.basicInfo: {
        const tempDetail = {
          name: values.name,
          title: values.title,
          linkedin: values.linkedin,
          github: values.github,
          email: values.email,
          phone: values.phone,
        };

        setInformation((prev) => ({
          ...prev,
          [sections.basicInfo]: {
            ...prev[sections.basicInfo],
            detail: tempDetail,
            sectionTitle,
          },
        }));
        break;
      }
      case sections.workExp: {
        const tempDetail = {
          certificationLink: values.certificationLink,
          title: values.title,
          startDate: values.startDate,
          endDate: values.endDate,
          companyName: values.companyName,
          location: values.location,
          points: values.points,
        };

        //this section can have more  than one item so we need to push it into the existing list by index
        const tempDetails = [...information[sections.workExp]?.details];
        tempDetails[activeDetailIndex] = tempDetail;

        setInformation((prev) => ({
          ...prev,
          [sections.workExp]: {
            ...prev[sections.workExp],
            details: tempDetails,
            sectionTitle,
          },
        }));
        break;
      }
      case sections.skill: {
        const tempDetail = {
          skill: values.skill,
        };

        //this section can have more  than one item so we need to push it into the existing list by index
        const tempDetails = [...information[sections.skill]?.details];
        tempDetails[activeDetailIndex] = tempDetail;

        setInformation((prev) => ({
          ...prev,
          [sections.skill]: {
            ...prev[sections.skill],
            details: tempDetails,
            sectionTitle,
          },
        }));
        break;
      }
      case sections.project: {
        const tempDetail = {
          link: values.link,
          title: values.title,
          overview: values.overview,
          github: values.github,
          points: values.points,
        };
        const tempDetails = [...information[sections.project]?.details];
        tempDetails[activeDetailIndex] = tempDetail;

        setInformation((prev) => ({
          ...prev,
          [sections.project]: {
            ...prev[sections.project],
            details: tempDetails,
            sectionTitle,
          },
        }));
        break;
      }
      case sections.education: {
        const tempDetail = {
          title: values.title,
          college: values.college,
          startDate: values.startDate,
          endDate: values.endDate,
        };
        const tempDetails = [...information[sections.education]?.details];
        tempDetails[activeDetailIndex] = tempDetail;

        setInformation((prev) => ({
          ...prev,
          [sections.education]: {
            ...prev[sections.education],
            details: tempDetails,
            sectionTitle,
          },
        }));
        break;
      }
      case sections.achievement: {
        const tempPoints = values.points;

        setInformation((prev) => ({
          ...prev,
          [sections.achievement]: {
            ...prev[sections.achievement],
            points: tempPoints,
            sectionTitle,
          },
        }));
        break;
      }
      case sections.summary: {
        const tempDetail = values.summary;

        setInformation((prev) => ({
          ...prev,
          [sections.summary]: {
            ...prev[sections.summary],
            detail: tempDetail,
            sectionTitle,
          },
        }));
        break;
      }
      case sections.other: {
        const tempDetail = values.other;

        setInformation((prev) => ({
          ...prev,
          [sections.other]: {
            ...prev[sections.other],
            detail: tempDetail,
            sectionTitle,
          },
        }));
        break;
      }
      case sections.oldResume: {
        const tempDetail = values.oldResumeFile;

        setInformation((prev) => ({
          ...prev,
          [sections.oldResume]: {
            ...prev[sections.oldResume],
            detail: tempDetail,
            sectionTitle,
          },
        }));
        break;
      }
    }
  };

  const handleAddNew = () => {
    const details = activeInformation?.details;
    if (!details) return;
    const lastDetail = details.slice(-1)[0];
    if (!Object.keys(lastDetail).length) return;
    details?.push({});

    setInformation((prev) => ({
      ...prev,
      [sections[activeSectionKey]]: {
        ...information[sections[activeSectionKey]],
        details: details,
      },
    }));
    setActiveDetailIndex(details?.length - 1);
  };

  const handleDeleteDetail = (index) => {
    const details = activeInformation?.details
      ? [...activeInformation?.details]
      : "";
    if (!details) return;
    details.splice(index, 1);
    setInformation((prev) => ({
      ...prev,
      [sections[activeSectionKey]]: {
        ...information[sections[activeSectionKey]],
        details: details,
      },
    }));

    setActiveDetailIndex((prev) => (prev === index ? 0 : prev - 1));
  };

  //changes the values when u switch to new section
  useEffect(() => {
    const activeInfo = information[sections[activeSectionKey]];
    setActiveInformation(activeInfo);
    setSectionTitle(sections[activeSectionKey]);
    setActiveDetailIndex(0);
    setFileError("");
    setValues({
      name: activeInfo?.detail?.name || "",
      overview: activeInfo?.details
        ? activeInfo.details[0]?.overview || ""
        : "",
      link: activeInfo?.details ? activeInfo.details[0]?.link || "" : "",
      certificationLink: activeInfo?.details
        ? activeInfo.details[0]?.certificationLink || ""
        : "",
      companyName: activeInfo?.details
        ? activeInfo.details[0]?.companyName || ""
        : "",
      skill: activeInfo?.details ? activeInfo.details[0]?.skill || "" : "",
      college: activeInfo?.details ? activeInfo.details[0]?.college || "" : "",
      location: activeInfo?.details
        ? activeInfo.details[0]?.location || ""
        : "",
      startDate: activeInfo?.details
        ? activeInfo.details[0]?.startDate || ""
        : "",
      endDate: activeInfo?.details ? activeInfo.details[0]?.endDate || "" : "",
      points: activeInfo?.details
        ? activeInfo.details[0]?.points
          ? [...activeInfo.details[0]?.points]
          : ""
        : activeInfo?.points
          ? [...activeInfo.points]
          : "",
      title: activeInfo?.details
        ? activeInfo.details[0]?.title || ""
        : activeInfo?.detail?.title || "",
      linkedin: activeInfo?.detail?.linkedin || "",
      github: activeInfo?.details
        ? activeInfo.details[0]?.github || ""
        : activeInfo?.detail?.github || "",
      phone: activeInfo?.detail?.phone || "",
      email: activeInfo?.detail?.email || "",
      summary: typeof activeInfo?.detail !== "object" ? activeInfo.detail : "",
      other: typeof activeInfo?.detail !== "object" ? activeInfo.detail : "",
      oldResumeFile: activeInfo?.detail?.data ? activeInfo.detail : null,
    });
  }, [activeSectionKey]);

  useEffect(() => {
    setActiveInformation(information[sections[activeSectionKey]]);
  }, [information]);

  //this useEffect is used when  the user clicks on a new button the values will be set accordingly
  useEffect(() => {
    const details = activeInformation?.details;
    if (!details) return;

    const activeInfo = information[sections[activeSectionKey]];
    setValues({
      overview: activeInfo.details[activeDetailIndex]?.overview || "",
      link: activeInfo.details[activeDetailIndex]?.link || "",
      certificationLink:
        activeInfo.details[activeDetailIndex]?.certificationLink || "",
      companyName: activeInfo.details[activeDetailIndex]?.companyName || "",
      skill: activeInfo.details[activeDetailIndex]?.skill || "",
      location: activeInfo.details[activeDetailIndex]?.location || "",
      startDate: activeInfo.details[activeDetailIndex]?.startDate || "",
      endDate: activeInfo.details[activeDetailIndex]?.endDate || "",
      points: activeInfo.details[activeDetailIndex]?.points || "",
      title: activeInfo.details[activeDetailIndex]?.title || "",
      linkedin: activeInfo.details[activeDetailIndex]?.linkedin || "",
      github: activeInfo.details[activeDetailIndex]?.github || "",
      college: activeInfo.details[activeDetailIndex]?.college || "",
    });
  }, [activeDetailIndex]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {Object.keys(sections)?.map((key) => (
          <div
            className={`${styles.section} ${
              activeSectionKey === key ? styles.active : ""
            }`}
            key={key}
            onClick={() => setActiveSectionKey(key)}>
            {sections[key]}
          </div>
        ))}
      </div>

      <div className={styles.body}>
        <InputControl
          label="Title"
          placeholder="Enter section title"
          value={sectionTitle}
          onChange={(event) => setSectionTitle(event.target.value)}
        />

        <div className={styles.chips}>
          {activeInformation?.details
            ? activeInformation?.details?.map((item, index) => (
                <div
                  className={`${styles.chip} ${
                    activeDetailIndex === index ? styles.active : ""
                  }`}
                  key={item.title + index}
                  onClick={() => setActiveDetailIndex(index)}>
                  <p>
                    {sections[activeSectionKey]} {index + 1}
                  </p>
                  <X
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteDetail(index);
                    }}
                  />
                </div>
              ))
            : ""}
          {activeInformation?.details &&
          activeInformation?.details?.length > 0 ? (
            <div className={styles.new} onClick={handleAddNew}>
              +
            </div>
          ) : (
            ""
          )}
        </div>

        {generateBody()}

        <button onClick={handleSubmission}>Save</button>
      </div>
    </div>
  );
}

export default Editor;
