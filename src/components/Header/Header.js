import React, { useState } from "react";
import resumeSvg from "../../assets/resume_svg.svg";
import styles from "./Header.module.css";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";

function Header() {
  const [isopen, setisOpen] = useState(false);

  const handleisOpen = () => {
    setisOpen((open) => !open);
  };

  return (
    <div className={styles.header}>
      {/* Navbar */}
      <div className={styles.navcontainer}>
        <nav className={styles.navbar}>
          <div className={styles.logo}>
            <h3>Resume Builder</h3>
          </div>
        </nav>
      </div>

      {/* Main Section */}
      <div className={styles.container}>
        <div className={styles.left}>
          <p className={styles.heading}>
            A <span>Resume</span> that stands out!
          </p>

          <p className={styles.heading}>
            Make your own resume. <span>It's free</span>
          </p>

          {/* Get Started */}
          <Link className={styles.link} to="/templates">
            Get Started
          </Link>
        </div>

        <div className={styles.right}>
          <img src={resumeSvg} alt="Resume" />
        </div>
      </div>
    </div>
  );
}

export default Header;
