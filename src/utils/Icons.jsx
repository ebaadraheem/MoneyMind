// This file contains a collection of SVG icons used in the application.
const IconSearch = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
       {" "}
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
     {" "}
  </svg>
);
const IconMenu = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
);
const IconPersonAdd = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
       {" "}
    <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
     {" "}
  </svg>
);

const IconReceipt = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
       {" "}
    <path d="M18 17.5V3h-2v2h-2V3h-2v2h-2V3H8v2H6V3H4v17h16c1.1 0 2-.9 2-2V7.5L18 5.76V17.5zM12 9h4v2h-4V9zm0 4h4v2h-4v-2z" />
     {" "}
  </svg>
);
const IconDelete = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    className={className}
    fill="currentColor"
  >
       {" "}
    <g
      fillRule="nonzero"
      stroke="none"
      strokeWidth="1"
      strokeLinecap="butt"
      strokeLinejoin="miter"
      strokeMiterlimit="10"
      fontFamily="none"
      fontWeight="none"
      fontSize="none"
      textAnchor="none"
      style={{ mixBlendMode: "normal" }}
    >
           {" "}
      <g transform="scale(16,16)">
               {" "}
        <path d="M6.49609,1c-0.82031,0 -1.49609,0.67578 -1.49609,1.49609v0.50391h-3v1h1v8.5c0,0.82813 0.67188,1.5 1.5,1.5h6c0.82813,0 1.5,-0.67187 1.5,-1.5v-8.5h1v-1h-3v-0.50391c0,-0.82031 -0.67578,-1.49609 -1.49609,-1.49609zM6.49609,2h2.00781c0.28125,0 0.49609,0.21484 0.49609,0.49609v0.50391h-3v-0.50391c0,-0.28125 0.21484,-0.49609 0.49609,-0.49609zM5,5h1v7h-1zM7,5h1v7h-1zM9,5h1v7h-1z" />
             {" "}
      </g>
         {" "}
    </g>
     {" "}
  </svg>
);

const IconRefresh = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
       {" "}
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.76 0 3.32.73 4.45 1.95L13 11h7V4l-2.35 2.35z" />
     {" "}
  </svg>
);
const IconClose = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
       {" "}
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
     {" "}
  </svg>
);

const IconCallReceived = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
        <path d="M20 5.41L18.59 4 7 15.59V9H5v10h10v-2H8.41L20 5.41z" /> {" "}
  </svg>
);
const IconHourglassEmpty = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
       {" "}
    <path d="M6 2v6h.01L6 8.01 10 12l-4 3.99-.01.01H6v6h12v-6h-.01L18 16l-4-4 4-3.99.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-10l-4-4V4h8v3.5l-4 4z" />
     {" "}
  </svg>
);
const IconToday = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
       {" "}
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
     {" "}
  </svg>
);
const IconCheckCircle = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
       {" "}
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-4.5-4.5L6.91 11l3.09 3.09L17.5 7.5 19 9l-9 9z" />
     {" "}
  </svg>
);
const IconError = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
       {" "}
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
     {" "}
  </svg>
);
const IconInfo = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
       {" "}
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
     {" "}
  </svg>
);

const IconAddShoppingCart = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
       {" "}
    <path d="M11 9H9V7h2v2zm-2 4h2v-2H9v2zm8-4h-2v2h2V9zm-2 4h2v-2h-2v2zm4-10H1V4h2v2h13.92l3.63-7L23 5l-2.07 4.73C20.46 11.16 18.06 12 15.5 12h-11c-.97 0-1.87-.4-2.52-1.07L1 8l.94-2.18L4 5l-.75-1.75L1 4.76V2h2V0h2v2h2v2H6.94l-.74 1.73c.09.02.18.04.28.06l-.01.01h10.02c2.61 0 4.91-.94 6.78-2.61L22.95 0l-.82-1.92-2.13 4.98L20 7l-.75-1.75L18.92 4h-2.07zm-4.73 17.27c-1.39 0-2.52-1.13-2.52-2.52 0-1.39 1.13-2.52 2.52-2.52s2.52 1.13 2.52 2.52c0 1.39-1.13 2.52-2.52 2.52zm-12.74 0c-1.39 0-2.52-1.13-2.52-2.52 0-1.39 1.13-2.52 2.52-2.52s2.52 1.13 2.52 2.52c0 1.39-1.13 2.52-2.52 2.52z" />
     {" "}
  </svg>
);
const IconShoppingCart = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
       {" "}
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-8.35-8.86l-.07-.38H3V6h-.5l-.42 2.76.99 2.14C3.81 10.96 4.3 11 4.5 11h9.17l3.96-6.99L18 3.84 16.21 16H8.35c-.83 0-1.5-.67-1.5-1.5 0-.82.67-1.5 1.5-1.5H16.2l1.63-2.88-2.5-4.39H6.94l-.35.7H4.5L5.78 13.5H16.2zm-.75 4l.32-1.76L6 9H4.5l-1.33 3H16.2L15.35 15H6.28z" />
     {" "}
  </svg>
);
const IconAttachMoney = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
       {" "}
    <path d="M11.8 10.9c-2.27-.59-3.41-1.38-3.41-2.91 0-1.39 1.11-2.52 2.74-2.52 1.48 0 2.53.94 2.75 2.22h2.02c-.27-2.31-2.12-4.16-4.77-4.16-3.14 0-5.32 2.53-5.32 5.34 0 3.32 2.52 4.01 4.88 4.77 2.45.82 3.48 1.7 3.48 3.32 0 1.64-1.32 2.78-3.23 2.78-1.79 0-3.3-1.07-3.69-2.61H6.18c.45 2.62 2.56 4.16 5.56 4.16 3.35 0 5.6-2.53 5.6-5.46 0-3.45-2.57-4.1-4.94-4.83z" />
     {" "}
  </svg>
);

const IconVisibility = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
       {" "}
    <path d="M12 4.5c-4.08 0-7.22 3.19-8.46 5.5l-.54 1c0 .28 0 .56.03.84.02.26.05.51.09.76.04.25.09.5.15.75.06.25.13.5.21.74.08.24.18.47.28.7.1.23.21.46.33.68.12.22.25.43.39.63.14.2.29.39.44.57.15.18.3.36.46.52.16.16.32.32.49.46.17.14.34.28.52.4.18.12.37.24.56.34.19.1.39.19.6.27.21.08.42.15.64.2.22.05.45.09.68.11.23.03.46.04.7.04.69 0 1.37-.05 2.05-.14.68-.09 1.36-.23 2.03-.42.67-.19 1.34-.43 1.99-.73.65-.3 1.29-.65 1.91-1.05.62-.4 1.22-.85 1.79-1.34.57-.49 1.12-1 1.63-1.55.51-.55.99-1.12 1.43-1.71.44-.59.84-1.2 1.21-1.83.37-.63.7-1.28.98-1.95.28-.67.5-1.36.67-2.07.17-.71.28-1.43.34-2.16.06-.73.09-1.48.09-2.23 0-2.48-1.63-4.56-3.8-5.32L12 4.5zm0 14c-2.48 0-4.5-2.02-4.5-4.5S9.52 9.5 12 9.5s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5zM12 11c-1.38 0-2.5 1.12-2.5 2.5S10.62 16 12 16s2.5-1.12 2.5-2.5S13.38 11 12 11z" />
     {" "}
  </svg>
);

const IconDashboard = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
       {" "}
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /> {" "}
  </svg>
);
const IconLock = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
       {" "}
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
     {" "}
  </svg>
);
const IconLogout = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
       {" "}
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
     {" "}
  </svg>
);

// --- NEW ICONS ADDED FOR SIDEBAR TOGGLE ---
const IconChevronLeft = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
);

const IconChevronRight = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
  </svg>
);

// Common Tailwind classes for icons for consistency
const defaultIconClasseshere = "inline-block align-middle";

export const IconEdit = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`${defaultIconClasseshere} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-1.5l.426-.957a2 2 0 012.784-1.042l3.418 1.423a2 2 0 011.042 2.784L17 17m-7-1.5l1.423 3.418a2 2 0 002.784 1.042L17 17"
    />
  </svg>
);

export const IconSave = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`${defaultIconClasseshere} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
    />
  </svg>
);

export const IconCancel = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`${defaultIconClasseshere} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export const IconAdd = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`${defaultIconClasseshere} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);

// Define your default icon classes here
// This will apply to all icons unless overridden by the className prop
const defaultIconClasses = "w-6 h-6"; 

// Now, define your icons using the provided structure

export const IconPOS = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`${defaultIconClasses} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21.75H5.125c-.622 0-1.22-.303-1.583-.814A4.5 4.5 0 0 1 3 16.5V9.75a3 3 0 0 1 .879-2.122L7.5 4.5h2.875c.622 0 1.22.303 1.583.814A4.5 4.5 0 0 1 12 9v7.5c0 .69-.028 1.365-.084 2.025H16.5A.75.75 0 0 0 17.25 18v-2.75a.75.75 0 0 0-.75-.75H14.25c-.21 0-.413.064-.587.186a.75.75 0 0 0-.313.636V18a.75.75 0 0 0 .75.75H20.25a.75.75 0 0 0 .75-.75V8.56c0-.071.011-.141.033-.21a1.5 1.5 0 0 0-.44-1.22L19.047 5.03c-.23-.193-.5-.304-.775-.357A.75.75 0 0 0 17.25 4.5H12c-.621 0-1.218.303-1.583.814A4.5 4.5 0 0 0 9 9.75v7.5Z" />
  </svg>
);

export const IconHeldInvoices = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`${defaultIconClasses} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 8.625.75-.75M13.5 13.5h.008v.008h-.008V13.5zm2.25 0h.008v.008H15.75v-.008zm2.25 0h.008v.008H18v-.008zm2.25 0h.008v.008H20.25v-.008zM4.5 14.25h-.008v.008H4.5v-.008zm2.25 0h.008v.008H6.75v-.008zm2.25 0h.008v.008H9v-.008z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-1.5A2.25 2.25 0 0 0 15.75 2.25h-1.5A2.25 2.25 0 0 0 12 4.5v2.25A2.25 2.25 0 0 0 9.75 9h-1.5A2.25 2.25 0 0 0 6 11.25V14.25A2.25 2.25 0 0 0 8.25 16.5H19.5V14.25z" />
  </svg>
);

export const IconSales = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`${defaultIconClasses} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125l6.002 4.997 3.582-1.792a4.5 4.5 0 0 1 4.382 0L21 17.625" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m-3-3h6" />
  </svg>
);

export const IconProducts = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`${defaultIconClasses} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 1.5l6 6m-6-6v14.25m6-14.25v14.25m-6 0h6m-6 0H3.75a2.25 2.25 0 0 1-2.25-2.25V10.5m1.5-4.5h15M6 18.75V16.5m3-3v3m3-3v3m3-3v3m3-3v3m-9-9h9m-9-6h9" />
  </svg>
);

export const IconCustomers = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`${defaultIconClasses} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.75H6a2.25 2.25 0 0 0-2.25 2.25v2.25h16.5V21a2.25 2.25 0 0 0-2.25-2.25ZM6 10.5a7.5 7.5 0 1 0 15 0 7.5 7.5 0 0 0-15 0Z" />
  </svg>
);

export const IconEmployees = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`${defaultIconClasses} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 10.5a1.5 1.5 0 0 0-1.5-1.5h-1.5a1.5 1.5 0 0 0-1.5 1.5v1.5a1.5 1.5 0 0 0 1.5 1.5h1.5a1.5 1.5 0 0 0 1.5-1.5v-1.5Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5a1.5 1.5 0 0 0-1.5-1.5H3a1.5 1.5 0 0 0-1.5-1.5V10.5a1.5 1.5 0 0 0 1.5-1.5h1.5a1.5 1.5 0 0 0 1.5 1.5v1.5a1.5 1.5 0 0 0-1.5 1.5H3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9 12a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z" />
  </svg>
);

export const IconSettings = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`${defaultIconClasses} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.515-1.03 1.571-1.03 2.086 0L13.752 7.07c.214.428.675.632 1.14.484l2.55-1.085c1.03-.438 1.834.46 1.408 1.408l-1.085 2.55c-.148.465.056.926.484 1.14l2.753 1.376c1.03.515 1.03 1.571 0 2.086l-2.753 1.376c-.428.214-.632.675-.484 1.14l1.085 2.55c.427.948-.46 1.834-1.408 1.408l-2.55-1.085c-.465-.148-.926.056-1.14.484l-1.376 2.753c-.515 1.03-1.571 1.03-2.086 0l-1.376-2.753c-.214-.428-.675-.632-1.14-.484l-2.55 1.085c-1.03.427-1.834-.46-1.408-1.408l1.085-2.55c.148-.465-.056-.926-.484-1.14L3.174 12.325c-1.03-.515-1.03-1.571 0-2.086l2.753-1.376c.428-.214.632-.675.484-1.14L6.37 5.862c-.427-.948.46-1.834 1.408-1.408l2.55 1.085c.465.148.926-.056 1.14-.484L10.325 4.317Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);


export const IconBuildingStore = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.41 2h9.18a2 2 0 0 1 1.41.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
    <path d="M12 7v3" />
  </svg>
);

export const IconUsers = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87C18.5 13.09 17.14 12 15 12h-3c-2.14 0-3.5 1.09-4 2.13C7 15.13 6.4 17 6 17" />
    <polyline points="17 7 19 7 22 7" />
    <polyline points="20 4 20 7 20 10" />
  </svg>
);

export const IconUser = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PrintIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 max-sm:w-5 max-sm:h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
    />
  </svg>
);
// --- END OF NEW ICONS ---

export {
  IconSearch,
  IconPersonAdd,
  IconReceipt,
  IconDelete,
  PrintIcon,
  IconRefresh,
  IconClose,
  IconCallReceived,
  IconAddShoppingCart,
  IconShoppingCart,
  IconAttachMoney,
  IconVisibility,
  IconDashboard,
  IconLock,
  IconLogout,
  IconHourglassEmpty,
  IconToday,
  IconCheckCircle,
  IconError,
  IconInfo,
  IconMenu,
  IconChevronLeft,
  IconChevronRight,
};
