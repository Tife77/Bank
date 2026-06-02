import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck, SquareCheck } from "lucide-react";
import logo from "./assets/onenevada.svg";


export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [documentationType, setDocumentationType] = useState("");
  const [ssnInput, setSsnInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleNext = () => {
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = () => {
    console.log("Form submitted with documentation type:", documentationType);
    // TODO: Submit form to backend
  };

  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      {/* ───────── HEADER ───────── */}
      <header className="bg-[white] h-20 flex items-center justify-between px-6 shadow-md">

        {/* Left */}
        <div className="flex items-center gap-5 text-black">

          {/* Menu */}
          <button className="text-3xl hover:opacity-80">
            ☰
          </button>
          <button className="text-2xl font-medium hover:opacity-80" onClick={handleGoToDashboard}>
            Exit
          </button>

          <button
            onClick={() => navigate("/signin")}
            className="text-2xl font-medium hover:opacity-80 text-black"
          >
            Sign In
          </button>

        </div>

        {/* Center Logo */}
{/* Center Logo */}
<div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">

  <div className="w-full h-14 bg-white flex items-center justify-center overflow-hidden">
    <img
      src={logo}
      alt="One Nevada Credit Union"
      className="w-full h-full object-contain"
    />
  </div>

</div>

      </header>

      {/* ───────── MAIN CONTENT ───────── */}
      <main className="max-w-5xl mx-auto px-6 py-12">

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-light text-center text-gray-700 leading-tight mb-10 md:mb-16">
          Open your One Nevada Credit Union Checking account
        </h1>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20 place-items-center">

          {/* Step 1 */}
<div className="flex flex-col items-center text-center w-full max-w-xs mx-auto">
        <div className="w-24 h-24 bg-[#1170cf] rounded-full flex items-center justify-center text-white mb-4 shadow-sm">
          <UserCheck size={44} strokeWidth={1.5} />
        </div>
        <p className="text-sm text-gray-600 font-medium">
          You'll need your SSN and driver's license or state ID.
        </p>
      </div>

          {/* Step 2 */}
    <div className="flex flex-col items-center text-center w-full max-w-xs mx-auto">
        <div className="w-24 h-24 bg-[#1170cf] rounded-full flex items-center justify-center text-white mb-4 shadow-sm">
          <SquareCheck size={44} strokeWidth={1.5} />
        </div>
        <p className="text-sm text-gray-600 font-medium">
          Set up your account preferences.
        </p>
      </div>

          {/* Step 3 */}
     <div className="flex flex-col items-center text-center w-full max-w-xs mx-auto">
      
      {/* Icon Container */}
      <div className="w-24 h-24 bg-[#1170cf] rounded-full flex items-center justify-center text-white mb-4 shadow-sm">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-12 h-12"
        >
          {/* Phone */}
          <rect x="3" y="2" width="9" height="16" rx="1.5" />
          <path d="M7.5 15h.01" strokeWidth="2" />
          
          {/* Card sliding behind it */}
          <rect x="10" y="6" width="11" height="8" rx="1" className="opacity-80" />
          <line x1="10" y1="9" x2="21" y2="9" strokeWidth="1" />
        </svg>
      </div>

      {/* Heading Text */}
      <h3 className="text-sm text-gray-600 font-medium">
        Start using your new account.
      </h3>
      
    </div>

        </div>
      </main>

      {/* ───────── STEP 1: PERSONAL INFORMATION ───────── */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-4xl mx-auto mt-10 mb-20">

  <h2 className="text-2xl font-semibold text-gray-700 mb-6">
    Personal Information
  </h2>

  {/* Form Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    {/* First Name */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        First Name
      </label>

      <input
        type="text"
        placeholder="Enter first name"
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-[#005EB8] focus:border-[#005EB8] text-gray-900"
      />
    </div>

    {/* Middle Name */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Middle Name
      </label>

      <input
        type="text"
        placeholder="Enter middle name"
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-[#005EB8] focus:border-[#005EB8] text-gray-900"
      />
    </div>

    {/* Last Name */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Last Name
      </label>

      <input
        type="text"
        placeholder="Enter last name"
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-[#005EB8] focus:border-[#005EB8] text-gray-900"
      />
    </div>

    {/* Suffix */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Suffix
      </label>

      <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-[#005EB8] focus:border-[#005EB8] text-gray-900">
        <option>Select suffix</option>
        <option>JR</option>
        <option>SR</option>
        <option>II</option>
        <option>III</option>
        <option>IV</option>
        <option>V</option>
        <option>VI</option>
        <option>VII</option>
        <option>VIII</option>
      </select>
    </div>

    {/* Date of Birth */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Date of Birth
      </label>

      <div className="relative">
        <input
          type="date"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-[#005EB8] focus:border-[#005EB8] text-gray-900"
        />
        <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>

    {/* Drivers License */}
 {/* Driver's License Upload */}
<div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-4">
    Upload Driver's License or State ID
  </label>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    {/* Front Upload */}
    <div>
      <p className="text-sm text-gray-600 mb-2 font-medium">
        Front Side
      </p>

      <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition">

        <div className="text-center px-4">

          <svg
            className="w-10 h-10 mx-auto text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>

          <p className="text-sm font-medium text-gray-700">
            Upload front of ID
          </p>

          <p className="text-xs text-gray-500 mt-1">
            JPG, PNG or PDF
          </p>

        </div>

        <input
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.pdf"
        />
      </label>
    </div>

    {/* Back Upload */}
    <div>
      <p className="text-sm text-gray-600 mb-2 font-medium">
        Back Side
      </p>

      <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition">

        <div className="text-center px-4">

          <svg
            className="w-10 h-10 mx-auto text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>

          <p className="text-sm font-medium text-gray-700">
            Upload back of ID
          </p>

          <p className="text-xs text-gray-500 mt-1">
            JPG, PNG or PDF
          </p>

        </div>

        <input
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.pdf"
        />
      </label>
    </div>

  </div>
</div>

    {/* Email */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Email Address
      </label>

      <input
        type="email"
        placeholder="Enter email address"
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-[#005EB8] focus:border-[#005EB8] text-gray-900"
      />
    </div>

    {/* Phone */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Phone Number
      </label>

      <input
        type="tel"
        placeholder="Enter phone number"
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-[#005EB8] focus:border-[#005EB8] text-gray-900"
      />
    </div>

    {/* Street Address */}
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Street Address
      </label>

      <input
        type="text"
        placeholder="Enter street address"
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-[#005EB8] focus:border-[#005EB8] text-gray-900"
      />
    </div>

    {/* Zip Code */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Zip Code
      </label>

      <input
        type="text"
        placeholder="Enter zip code"
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-[#005EB8] focus:border-[#005EB8] text-gray-900"
      />
    </div>

    {/* City */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        City
      </label>

      <input
        type="text"
        placeholder="Enter city"
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-[#005EB8] focus:border-[#005EB8] text-gray-900"
      />
    </div>

    {/* State */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        State
      </label>

      <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-[#005EB8] focus:border-[#005EB8] text-gray-900">
        <option>Select state</option>
        <option>California</option>
        <option>Texas</option>
        <option>Florida</option>
        <option>New York</option>
        <option>Illinois</option>
      </select>
    </div>

  </div>

  {/* Citizenship Section */}
  <div className="mt-8">

    <label className="block text-sm font-medium text-gray-700 mb-3">
      Are you a U.S Citizen?
    </label>

    <div className="flex gap-8">

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="radio" name="citizen" className="accent-[#005EB8]" />
        Yes
      </label>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="radio" name="citizen" className="accent-[#005EB8]" />
        No
      </label>

    </div>

  </div>

  {/* Green Card Section */}
  <div className="mt-6">

    <label className="block text-sm font-medium text-gray-700 mb-3">
      Do you have a Green Card?
    </label>

    <div className="flex gap-8">

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="radio" name="greenCard" className="accent-[#005EB8]" />
        Yes
      </label>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="radio" name="greenCard" className="accent-[#005EB8]" />
        No
      </label>

    </div>

  </div>

  {/* Next Button */}
  <div className="flex justify-end mt-10">
    <button onClick={handleNext} className="bg-[#005EB8] hover:bg-[#004A92] transition text-white px-8 py-3 rounded-lg text-base font-semibold shadow-md">
      Next →
    </button>
  </div>
</div>
      )}

      {/* ───────── STEP 2: INCOME DOCUMENTATION ───────── */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-4xl mx-auto mt-10 mb-20">

  <h2 className="text-2xl font-semibold text-gray-700 mb-2">
    Income Documentation
  </h2>
  <p className="text-gray-600 mb-8">Step 2: Select one form of income documentation</p>

  {/* Documentation Options */}
  <div className="space-y-6">

    {/* Option 1: Social Security */}
    <label className="flex items-start p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
      <input
        type="radio"
        name="documentation"
        value="social_security"
        checked={documentationType === "social_security"}
        onChange={(e) => {
          setDocumentationType(e.target.value);
          setUploadedFile(null);
        }}
        className="mt-1 w-4 h-4 accent-[#005EB8]"
      />
      <div className="ml-4 flex-1">
        <p className="font-semibold text-gray-900">Social Security Card or Number</p>
        <p className="text-sm text-gray-600 mt-1">Valid Social Security card or official SSN documentation</p>
        
        {documentationType === "social_security" && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter your Social Security Number (XXX-XX-XXXX)"
              value={ssnInput}
              onChange={(e) => setSsnInput(e.target.value)}
              maxLength="11"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-[#005EB8] focus:border-[#005EB8] text-gray-900"
            />
          </div>
        )}
      </div>
    </label>

    {/* Option 2: Previous Bank Financial Records */}
    <label className="flex items-start p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
      <input
        type="radio"
        name="documentation"
        value="bank_records"
        checked={documentationType === "bank_records"}
        onChange={(e) => {
          setDocumentationType(e.target.value);
          setSsnInput("");
        }}
        className="mt-1 w-4 h-4 accent-[#005EB8]"
      />
      <div className="ml-4 flex-1">
        <p className="font-semibold text-gray-900">Previous Bank Financial Records</p>
        <p className="text-sm text-gray-600 mt-1">
          Supporting documents such as:
        </p>
        <ul className="text-sm text-gray-600 mt-2 ml-4 list-disc">
          <li>Loan applications</li>
          <li>Mortgage paperwork</li>
          <li>Credit applications</li>
          <li>Investment account statements</li>
        </ul>
        
        {documentationType === "bank_records" && (
          <div className="mt-4">
            <label className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <p className="text-sm text-gray-700 font-medium">Click to upload document</p>
                <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (Max 10MB)</p>
              </div>
              <input
                type="file"
                onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                className="hidden"
                accept=".pdf,.doc,.docx"
              />
            </label>
            {uploadedFile && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700"><strong>File selected:</strong> {uploadedFile.name}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </label>

    {/* Option 3: Employment Records */}
    <label className="flex items-start p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
      <input
        type="radio"
        name="documentation"
        value="employment_records"
        checked={documentationType === "employment_records"}
        onChange={(e) => {
          setDocumentationType(e.target.value);
          setSsnInput("");
        }}
        className="mt-1 w-4 h-4 accent-[#005EB8]"
      />
      <div className="ml-4 flex-1">
        <p className="font-semibold text-gray-900">Employment Records</p>
        <p className="text-sm text-gray-600 mt-1">
          Supporting documents such as:
        </p>
        <ul className="text-sm text-gray-600 mt-2 ml-4 list-disc">
          <li>Payroll records</li>
          <li>HR onboarding documents</li>
        </ul>
        
        {documentationType === "employment_records" && (
          <div className="mt-4">
            <label className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <p className="text-sm text-gray-700 font-medium">Click to upload document</p>
                <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (Max 10MB)</p>
              </div>
              <input
                type="file"
                onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                className="hidden"
                accept=".pdf,.doc,.docx"
              />
            </label>
            {uploadedFile && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700"><strong>File selected:</strong> {uploadedFile.name}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </label>

    {/* Option 4: Government-Issued Benefit or Insurance Documents */}
    <label className="flex items-start p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
      <input
        type="radio"
        name="documentation"
        value="government_benefits"
        checked={documentationType === "government_benefits"}
        onChange={(e) => {
          setDocumentationType(e.target.value);
          setSsnInput("");
        }}
        className="mt-1 w-4 h-4 accent-[#005EB8]"
      />
      <div className="ml-4 flex-1">
        <p className="font-semibold text-gray-900">Government-Issued Benefit or Insurance Documents</p>
        <p className="text-sm text-gray-600 mt-1">
          Supporting documents such as:
        </p>
        <ul className="text-sm text-gray-600 mt-2 ml-4 list-disc">
          <li>Medicare or Medicaid paperwork</li>
          <li>Veterans Affairs records</li>
          <li>Unemployment benefit documents</li>
        </ul>
        
        {documentationType === "government_benefits" && (
          <div className="mt-4">
            <label className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <p className="text-sm text-gray-700 font-medium">Click to upload document</p>
                <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (Max 10MB)</p>
              </div>
              <input
                type="file"
                onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                className="hidden"
                accept=".pdf,.doc,.docx"
              />
            </label>
            {uploadedFile && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700"><strong>File selected:</strong> {uploadedFile.name}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </label>

  </div>

  {/* Action Buttons */}
  <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
    <button
      type="button"
      onClick={handleBack}
      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition"
    >
      ← Back
    </button>
    <button
      type="button"
      onClick={handleSubmit}
      disabled={!documentationType}
      className="px-8 py-3 bg-[#005EB8] text-white rounded-md font-medium hover:bg-[#004a96] transition disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      Submit
    </button>
  </div>
</div>
      )}

      {/* Footer Section - White */}
      <footer className="bg-white w-full py-8 shadow-sm mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-600 text-sm">
        </div>
      </footer>
    </div>
  );
}
