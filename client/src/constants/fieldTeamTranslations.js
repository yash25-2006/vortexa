/**
 * Field Team Multilingual Translations Registry (Jan Setu)
 * Supports English (en), Marathi (mr), and Hindi (hi).
 */

import { WARD_TRANSLATIONS, CITIZEN_CONTENT_TRANSLATIONS, getTranslatedCitizenText, getLocalizedCategory, getLocalizedUrgency, getLocalizedStatus } from './wardTranslations';

export const FIELD_TEAM_TRANSLATIONS = {
  mr: {
    ...WARD_TRANSLATIONS.mr,
    // Field Team Specific UI Translations
    portalBadge: "शासकीय क्षेत्रीय कार्यप्रणाली पोर्टल",
    fieldTeamOperations: "शासकीय क्षेत्रीय कार्यप्रणाली व कृती दल",
    teamCode: "पथक संकेतांक",
    activeStatusOnDuty: "कर्तव्यावर उपस्थित (Active on Duty)",
    unitStrength: "कर्मचारी संख्या",
    jurisdictionArea: "कार्यक्षेत्र",
    leadOfficer: "प्रमुख अधिकारी",
    departmentWing: "विभाग / शाखा",

    // Tabs & Filters
    allWorkOrders: "सर्व कार्य आदेश (All Tasks)",
    assignedWorkOrders: "नवीन सोपवलेली कामे (Assigned)",
    inProgressWorkOrders: "सुरू असलेली कामे (In Progress)",
    completedWorkOrders: "पूर्ण झालेली कामे (Completed)",
    searchPlaceholder: "तक्रार क्रमांक, ठिकाण किंवा समस्या शोधा...",
    refreshList: "ताजे करा",

    // Work Order Cards
    workOrderId: "कार्य आदेश क्र.",
    citizenComplaintId: "नागरी तक्रार क्र.",
    locationLabel: "ठिकाण:",
    assignedDate: "सोपवल्याची तारीख:",
    startedDate: "काम सुरू झाल्याची तारीख:",
    completedDate: "पूर्ण झाल्याची तारीख:",
    resolutionDuration: "निवारण कालावधी:",
    statusLabel: "सद्यस्थिती:",
    priorityLabel: "प्राधान्य:",
    actionRequired: "पुढील कृती:",

    // Action Buttons
    startTaskBtn: "काम सुरू करा (Start Task)",
    completeTaskBtn: "काम पूर्ण नोंदवा (Complete Task)",
    viewTaskDetailsBtn: "तपशील पहा",
    closeModal: "बंद करा",

    // Start Task Modal & Before Photo
    startTaskModalTitle: "कार्य आदेश सुरू करा — कामापूर्वीचा फोटो (Before Photo) आवश्यक",
    startTaskModalDesc: "काम प्रत्यक्ष सुरू करण्यापूर्वी घटनास्थळाचा प्रत्यक्ष 'कामापूर्वीचा फोटो' जोडणे बंधनकारक आहे.",
    attachBeforePhoto: "कामापूर्वीचा फोटो जोडा (Attach Before Photo) *",
    takeLivePhoto: "📷 कॅमेऱ्याने थेट फोटो काढा",
    uploadPhoto: "🖼️ गॅलरी / फाईल अपलोड करा",
    selectDemoPreset: "किंवा चाचणीसाठी प्रमाणित फोटो निवडा:",
    switchCamera: "कॅमेरा बदला",
    capturePhoto: "फोटो कॅप्चर करा",
    retakePhoto: "पुन्हा फोटो काढा",
    removePhoto: "फोटो काढा",
    cameraPermissionDenied: "कॅमेरा सुरू करता आला नाही. कृपया ब्राऊझर कॅमेरा परवानगी तपासा किंवा फाईल अपलोड पर्याय वापरा.",
    startWorkNotes: "कामाच्या सुरुवातीची नोंद / शेरा (पर्यायी)",
    startWorkNotesPlaceholder: "कामाच्या सुरुवातीबद्दल नोंद लिहा (उदा. पथक घटनास्थळी हजर, साधनसामग्री तयार)...",
    confirmStartTask: "काम सुरू झाल्याची पुष्टी करा",
    startingTask: "नोंद होत आहे...",

    // Complete Task Modal & After Photo
    completeTaskModalTitle: "काम पूर्ण झाल्याची नोंद — कामानंतरचा फोटो (After Photo) आवश्यक",
    completeTaskModalDesc: "काम पूर्ण झाल्यावर निवारण झालेला प्रत्यक्ष 'कामानंतरचा फोटो' आणि पूर्णता अहवाल देणे बंधनकारक आहे.",
    attachAfterPhoto: "कामानंतरचा फोटो जोडा (Attach After Photo) *",
    completionNotesLabel: "कामाचा पूर्णता अहवाल व शेरा *",
    completionNotesPlaceholder: "झालेल्या कामाचा सविस्तर अहवाल लिहा (उदा. खड्डे डांबराने भरून रोलिंग पूर्ण केले, रस्ता वाहतुकीस मोकळा)...",
    confirmCompleteTask: "काम पूर्ण म्हणून सबमिट करा",
    completingTask: "सबमिट होत आहे...",

    // Task Details Modal
    taskDetailsTitle: "क्षेत्रीय कार्य आदेश सविस्तर माहिती",
    workOrderSummary: "कार्य आदेश तपशील",
    beforeAndAfterEvidence: "कामापूर्वी आणि कामानंतरचे पुरावे",
    beforeWorkPhoto: "कामापूर्वीची स्थिती (Before)",
    afterWorkPhoto: "कामानंतरची स्थिती (After)",
    originalCitizenComplaint: "नागरिकाची मूळ तक्रार",
    citizenDescription: "तक्रार विवरण:",
    affectedCitizens: "प्रभावित नागरिक:",
    officerNotes: "अधिकारी शेरा व सूचना:",
    completionReportNote: "क्षेत्रीय पूर्णता अहवाल:",
    noTasksFound: "या वर्गात कोणतीही कामे उपलब्ध नाहीत.",
    noTasksDesc: "सर्व वाटप केलेली कामे सुरळीत चालू आहेत किंवा नवीन वाटप प्रलंबित आहे."
  },

  hi: {
    ...WARD_TRANSLATIONS.hi,
    // Field Team Specific UI Translations
    portalBadge: "सरकारी फील्ड ऑपरेशंस पोर्टल",
    fieldTeamOperations: "सरकारी फील्ड ऑपरेशंस एवं कार्य बल",
    teamCode: "टीम कोड",
    activeStatusOnDuty: "ड्यूटी पर सक्रिय (Active on Duty)",
    unitStrength: "कार्यबल संख्या",
    jurisdictionArea: "अधिकार क्षेत्र",
    leadOfficer: "प्रभारी अधिकारी",
    departmentWing: "विभाग / शाखा",

    // Tabs & Filters
    allWorkOrders: "सभी कार्य आदेश (All Tasks)",
    assignedWorkOrders: "नए सौंपे गए कार्य (Assigned)",
    inProgressWorkOrders: "प्रगतिरत कार्य (In Progress)",
    completedWorkOrders: "पूर्ण कार्य (Completed)",
    searchPlaceholder: "शिकायत क्रमांक, स्थान या समस्या खोजें...",
    refreshList: "ताज़ा करें",

    // Work Order Cards
    workOrderId: "कार्य आदेश क्र.",
    citizenComplaintId: "नागरिक शिकायत क्र.",
    locationLabel: "स्थान:",
    assignedDate: "सौंपने की तिथि:",
    startedDate: "कार्य प्रारंभ तिथि:",
    completedDate: "पूर्णता तिथि:",
    resolutionDuration: "निवारण समय:",
    statusLabel: "वर्तमान स्थिति:",
    priorityLabel: "प्राथमिकता:",
    actionRequired: "आवश्यक कार्रवाई:",

    // Action Buttons
    startTaskBtn: "कार्य प्रारंभ करें (Start Task)",
    completeTaskBtn: "कार्य पूर्ण चिह्नित करें (Complete Task)",
    viewTaskDetailsBtn: "विवरण देखें",
    closeModal: "बंद करें",

    // Start Task Modal & Before Photo
    startTaskModalTitle: "कार्य प्रारंभ करें — कार्य-पूर्व फोटो (Before Photo) अनिवार्य",
    startTaskModalDesc: "कार्य प्रारंभ करने से पहले घटनास्थल की 'कार्य-पूर्व फोटो' संलग्न करना अनिवार्य है।",
    attachBeforePhoto: "कार्य-पूर्व फोटो संलग्न करें (Attach Before Photo) *",
    takeLivePhoto: "📷 कैमरे से लाइव फोटो लें",
    uploadPhoto: "🖼️ गैलरी / फ़ाइल अपलोड करें",
    selectDemoPreset: "या परीक्षण हेतु प्रमाणित फोटो चुनें:",
    switchCamera: "कैमरा बदलें",
    capturePhoto: "फोटो कैप्चर करें",
    retakePhoto: "पुनः फोटो लें",
    removePhoto: "फोटो हटाएं",
    cameraPermissionDenied: "कैमरा प्रारंभ नहीं हो सका। कृपया कैमरा अनुमति जांचें या फ़ाइल अपलोड विकल्प का उपयोग करें।",
    startWorkNotes: "कार्य प्रारंभ संबंधी टिप्पणी (वैकल्पिक)",
    startWorkNotesPlaceholder: "कार्य प्रारंभ के संबंध में टिप्पणी दर्ज करें (उदा. टीम मौके पर मौजूद, उपकरण तैनात)...",
    confirmStartTask: "कार्य प्रारंभ की पुष्टि करें",
    startingTask: "प्रक्रिया जारी है...",

    // Complete Task Modal & After Photo
    completeTaskModalTitle: "कार्य पूर्णता दर्ज करें — कार्योपरांत फोटो (After Photo) अनिवार्य",
    completeTaskModalDesc: "कार्य पूर्ण होने पर निवारण की 'कार्योपरांत फोटो' एवं पूर्णता रिपोर्ट दर्ज करना अनिवार्य है।",
    attachAfterPhoto: "कार्योपरांत फोटो संलग्न करें (Attach After Photo) *",
    completionNotesLabel: "कार्य पूर्णता रिपोर्ट एवं टिप्पणी *",
    completionNotesPlaceholder: "किए गए कार्य की विस्तृत रिपोर्ट लिखें (उदा. गड्ढों की मरम्मत और डामरीकरण पूर्ण किया गया)...",
    confirmCompleteTask: "कार्य पूर्ण के रूप में सबमिट करें",
    completingTask: "सबमिट हो रहा है...",

    // Task Details Modal
    taskDetailsTitle: "फील्ड कार्य आदेश विस्तृत जानकारी",
    workOrderSummary: "कार्य आदेश विवरण",
    beforeAndAfterEvidence: "कार्य-पूर्व एवं कार्योपरांत साक्ष्य",
    beforeWorkPhoto: "कार्य-पूर्व स्थिति (Before)",
    afterWorkPhoto: "कार्योपरांत स्थिति (After)",
    originalCitizenComplaint: "नागरिक की मूल शिकायत",
    citizenDescription: "शिकायत विवरण:",
    affectedCitizens: "प्रभावित नागरिक:",
    officerNotes: "अधिकारी निर्देश एवं टिप्पणी:",
    completionReportNote: "फील्ड पूर्णता रिपोर्ट:",
    noTasksFound: "इस श्रेणी में कोई कार्य उपलब्ध नहीं है।",
    noTasksDesc: "सभी आवंटित कार्य सुचारू रूप से पूरे हो चुके हैं अथवा नया आवंटन प्रतीक्षित है।"
  },

  en: {
    ...WARD_TRANSLATIONS.en,
    // Field Team Specific UI Translations
    portalBadge: "Government Field Operations Portal",
    fieldTeamOperations: "Field Execution & Quick Response Operations",
    teamCode: "Team Code",
    activeStatusOnDuty: "Active on Duty",
    unitStrength: "Unit Strength",
    jurisdictionArea: "Jurisdiction",
    leadOfficer: "Lead Officer",
    departmentWing: "Department / Wing",

    // Tabs & Filters
    allWorkOrders: "All Work Orders",
    assignedWorkOrders: "Assigned (Pending Start)",
    inProgressWorkOrders: "In Progress (On-Site)",
    completedWorkOrders: "Completed (Resolved)",
    searchPlaceholder: "Search by work order ID, complaint ID, or keyword...",
    refreshList: "Refresh",

    // Work Order Cards
    workOrderId: "Work Order",
    citizenComplaintId: "Complaint ID",
    locationLabel: "Location:",
    assignedDate: "Assigned On:",
    startedDate: "Started On:",
    completedDate: "Completed On:",
    resolutionDuration: "Resolution Time:",
    statusLabel: "Status:",
    priorityLabel: "Priority:",
    actionRequired: "Action:",

    // Action Buttons
    startTaskBtn: "Start Task",
    completeTaskBtn: "Complete Task",
    viewTaskDetailsBtn: "View Details",
    closeModal: "Close",

    // Start Task Modal & Before Photo
    startTaskModalTitle: "Start Work Order — Before Photo Mandatory",
    startTaskModalDesc: "Attaching an on-site 'Before Photo' is mandatory before commencing execution on this work order.",
    attachBeforePhoto: "Attach Before Photo *",
    takeLivePhoto: "📷 Take Live Photo",
    uploadPhoto: "🖼️ Upload Photo",
    selectDemoPreset: "Or select a verified sample photo for testing:",
    switchCamera: "Switch Camera",
    capturePhoto: "Capture Photo",
    retakePhoto: "Retake Photo",
    removePhoto: "Remove Photo",
    cameraPermissionDenied: "Could not access device camera. Please check camera permissions or use the Upload Photo option.",
    startWorkNotes: "Initial Work Notes / Remarks (Optional)",
    startWorkNotesPlaceholder: "Note on-site observations or initial equipment deployed...",
    confirmStartTask: "Confirm & Start Task",
    startingTask: "Starting Task...",

    // Complete Task Modal & After Photo
    completeTaskModalTitle: "Complete Work Order — After Photo & Report Mandatory",
    completeTaskModalDesc: "Attaching a verified 'After Photo' of the resolved site and submitting a completion report is mandatory.",
    attachAfterPhoto: "Attach After Photo *",
    completionNotesLabel: "Field Completion Report & Notes *",
    completionNotesPlaceholder: "Describe the remediation work executed (e.g. asphalt patching completed and leveled with roller)...",
    confirmCompleteTask: "Submit Work Order Completion",
    completingTask: "Submitting...",

    // Task Details Modal
    taskDetailsTitle: "Work Order Field Dossier",
    workOrderSummary: "Work Order Summary",
    beforeAndAfterEvidence: "Before & After Field Photographic Evidence",
    beforeWorkPhoto: "Initial Condition (Before)",
    afterWorkPhoto: "Remediated Condition (After)",
    originalCitizenComplaint: "Citizen Grievance Context",
    citizenDescription: "Citizen Statement:",
    affectedCitizens: "Affected Group:",
    officerNotes: "Ward In-charge Instructions:",
    completionReportNote: "Squad Completion Report:",
    noTasksFound: "No work orders in this category.",
    noTasksDesc: "All assigned field tasks have been serviced or are awaiting dispatch from the Ward In-charge."
  }
};

export {
  getTranslatedCitizenText,
  getLocalizedCategory,
  getLocalizedUrgency,
  getLocalizedStatus,
  CITIZEN_CONTENT_TRANSLATIONS
};
