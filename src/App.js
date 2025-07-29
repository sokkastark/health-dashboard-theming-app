import React, { useState, createContext, useContext } from 'react'; // Removed useRef, Suspense, useEffect for 2D
import './App.css';

// --- 1. Define Theme Context ---
const ThemeContext = createContext(null);

// --- 2. Theme Provider Component ---
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark'); // Default theme
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = (prevTheme === 'dark' ? 'light' : 'dark');
      console.log("Switching theme to:", newTheme); // Debugging log
      return newTheme;
    });
  };

  const themeColors = {
    dark: {
      bodyBg: 'var(--color-dark-bg)',
      panelBg: 'var(--color-dark-panel-bg)',
      panelAccent: 'var(--color-dark-panel-accent)',
      textColor: 'var(--color-dark-text)',
      headingColor: 'var(--color-dark-heading)',
      highlightColor: 'var(--color-dark-highlight)',
      // Image paths for dark theme (ensure these names match your files in public folder)
      bodySkinImage: process.env.PUBLIC_URL + '/body_skin_dark.png',
      bodyPlainImage: process.env.PUBLIC_URL + '/body_plain_dark.png',
      organLungsImage: process.env.PUBLIC_URL + '/organ_lungs_dark.png',
      // If you have other specific organ icons for the dark theme, add them here
    },
    light: {
      bodyBg: 'var(--color-light-bg)',
      panelBg: 'var(--color-light-panel-bg)',
      panelAccent: 'var(--color-light-panel-accent)',
      textColor: 'var(--color-light-text)',
      headingColor: 'var(--color-light-heading)',
      highlightColor: 'var(--color-light-highlight)',
      // Image paths for light theme (ensure these names match your files in public folder)
      bodySkinImage: process.env.PUBLIC_URL + '/body_skin_light.png',
      bodyPlainImage: process.env.PUBLIC_URL + '/body_plain_light.png',
      organLungsImage: process.env.PUBLIC_URL + '/organ_lungs_light.png',
      // If you have other specific organ icons for the light theme, add them here
    },
  };

  const currentTheme = themeColors[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// --- Data for 2D Organ Overlays (Lungs for this prototype) ---
// These positions will need precise pixel tuning!
const LAYERED_ORGANS_DATA = [
  {
    id: 'lungs',
    name: 'Lungs',
    position: { top: '16%', left: '25%' }, // Adjust for precise layering on body_plain image
    size: { width: '50%', height: '18%' }, // Adjust for lungs image size
    healthStatus: 'weak', // Example status
  },
  // Add more organs here if you expand manual layering
];

// --- Main App Component ---
function App() {
  const { theme, toggleTheme, currentTheme } = useContext(ThemeContext);

  // State to manage 'Body' vs 'Organs' view
  const [viewMode, setViewMode] = useState('body'); // 'body' or 'organs'

  // State for organ interaction (only lungs for now)
  const [activeOrganId, setActiveOrganId] = useState(null); // ID of currently active organ (e.g., 'lungs')
  const [isLungsHovered, setIsLungsHovered] = useState(false); // Specific hover state for lungs

  // Determine base body image based on theme and viewMode
  const baseBodyImage = viewMode === 'body' ? currentTheme.bodySkinImage : currentTheme.bodyPlainImage;

  // Component for the single layered organ (Lungs for now)
  const Organ = ({ organData, isVisible, isHovered, onMouseEnter, onMouseLeave }) => {
    if (!isVisible || !organData) return null;

    return (
      <img
        src={currentTheme.organLungsImage} // Use specific organ image for lungs
        alt={organData.name}
        className={`organ-overlay ${isHovered ? 'hovered' : ''}`}
        style={{
          position: 'absolute',
          top: organData.position.top,
          left: organData.position.left,
          width: organData.size.width,
          height: organData.size.height,
          cursor: 'pointer', // Show pointer for clickable/hoverable organs
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={() => setActiveOrganId(organData.id)} // Set active organ on click
      />
    );
  };

  // Data for Right Panel Meter
  const getHealthMetric = (status) => {
    let value, color;
    switch (status) {
      case 'good': value = 80; color = 'green'; break;
      case 'moderate': value = 50; color = 'orange'; break;
      case 'weak': value = 20; color = 'red'; break;
      default: value = 0; color = 'gray'; break;
    }
    return { value, color };
  };

  const currentOrganHealth = activeOrganId ? getHealthMetric(LAYERED_ORGANS_DATA.find(o => o.id === activeOrganId)?.healthStatus) : null;


  return (
    <div className={`app-container ${theme}-theme`}> {/* Add theme class to container */}
      {/* Overlay Header */}
      <header className="app-header">
        <div className="header-content-left">
         <h1>Patient Health Dashboard</h1>
         <p className="patient-details">Chron, Stark | 08/22/1990 | 34 | M</p>
        </div>
        <button onClick={toggleTheme} className="theme-toggle-button">
          Switch to {theme === 'dark' ? 'Light' : 'Dark'} Theme
        </button>
      </header>

      <div className="main-content-wrapper"> {/* New wrapper for 3 columns */}
        {/* Left Panel */}
        <div className="left-panel">
          <h2>View Mode:</h2>
          <ul>
            <li>
              <button onClick={() => setViewMode('body')} className={viewMode === 'body' ? 'selected-view' : ''}>Body</button>
            </li>
            <li>
              <button onClick={() => setViewMode('organs')} className={viewMode === 'organs' ? 'selected-view' : ''}>Organs</button>
            </li>
          </ul>
          {/* Basic Organ list for interactivity */}
          {viewMode === 'organs' && (
            <>
              <h2>Organs (Interactive):</h2>
              <ul>
                {LAYERED_ORGANS_DATA.map(organ => (
                  <li
                    key={organ.id}
                    onMouseEnter={() => setIsLungsHovered(true)} // Currently only one organ (lungs)
                    onMouseLeave={() => setIsLungsHovered(false)} // Currently only one organ (lungs)
                    onClick={() => setActiveOrganId(organ.id)}
                    className={activeOrganId === organ.id ? 'selected-item' : ''}
                  >
                    {organ.name}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Middle Section: Body Image with Organ Overlay */}
        <div className="middle-section-body-container">
          <img
            src={baseBodyImage}
            alt={viewMode === 'body' ? 'Human Body' : 'Human Body Outline'}
            className="base-body-image"
          />
          {/* Organ overlay for Lungs */}
          <Organ
            organData={LAYERED_ORGANS_DATA.find(o => o.id === 'lungs')} // Pass specific lungs data
            isVisible={viewMode === 'organs'}
            isHovered={isLungsHovered}
            onMouseEnter={() => setIsLungsHovered(true)}
            onMouseLeave={() => setIsLungsHovered(false)}
          />
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <h2>Organ Health Metrics:</h2>
          {activeOrganId && currentOrganHealth ? (
            <div className="health-meter-container">
              <h3>{LAYERED_ORGANS_DATA.find(o => o.id === activeOrganId)?.name} Health</h3>
              <div className="meter-bar-outer">
                <div
                  className="meter-bar-inner"
                  style={{ width: `${currentOrganHealth.value}%`, backgroundColor: currentOrganHealth.color }}
                ></div>
              </div>
              <p>Status: {LAYERED_ORGANS_DATA.find(o => o.id === activeOrganId)?.healthStatus.charAt(0).toUpperCase() + LAYERED_ORGANS_DATA.find(o => o.id === activeOrganId)?.healthStatus.slice(1)}</p>
            </div>
          ) : (
            <p>Hover over or select an organ to see its health metrics.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrap the App component with ThemeProvider
function Root() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

export default Root;