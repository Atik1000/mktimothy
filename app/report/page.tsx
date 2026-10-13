"use client";
import Button from "@/components/globals/Button";
import React, { useState } from "react";
import { FaShieldAlt } from "react-icons/fa";

export default function ReportPage() {
  const [selectedType, setSelectedType] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Add selected type manually since it's outside the form or managed by state
    formData.append("selectedType", selectedType);

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        body: formData, // Sending FormData directly to support file uploads
      });

      const result = await response.json();

      if (response.ok) {
        setStatusMessage({
          type: "success",
          text: "Your abuse report has been submitted successfully. We will review it shortly.",
        });
        form.reset();
      } else {
        setStatusMessage({
          type: "error",
          text:
            result.message ||
            "Failed to submit the report. Please try again later.",
        });
      }
    } catch (error) {
      console.error(error);
      setStatusMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const abuseTypes = [
    { value: "phishing", label: "Phishing" },
    { value: "spam-abuse", label: "Spam" },
    { value: "copyright", label: "Copyright Violation" },
    { value: "trademark-cybersquatting", label: "Trademark / Cybersquatting" },
    { value: "trademark-infringement", label: "Trademark Infringement" },
    { value: "child-abuse", label: "Child Sexual Abuse Material" },
    {
      value: "non-consensual-explicit",
      label: "Non-Consensual Explicit Content",
    },
    { value: "illegal-pharmacy", label: "Illegal Pharmacy" },
    { value: "fake-whois", label: "Fake Whois Information" },
    { value: "defamation", label: "Defamation" },
    { value: "malware-and-botnet", label: "Malware / Botnets" },
  ];

  type FieldConfig = {
    name: string;
    label: string;
    type: "text" | "textarea" | "file";
    optional?: boolean;
    rows?: number;
  };

  const reportFieldsConfig: Record<string, FieldConfig[]> = {
    "spam-abuse": [
      { name: "domainName", label: "Domain Name", type: "text" },
      {
        name: "caseNumber",
        label: "Reference or Case Number",
        type: "text",
        optional: true,
      },
      {
        name: "officialWebsite",
        label: "Official Website",
        type: "text",
        optional: true,
      },
      {
        name: "emailHeaders",
        label: "Full Email Headers",
        type: "textarea",
        rows: 4,
      },
      {
        name: "messageBody",
        label: "Spam Email Content / Message Body",
        type: "textarea",
        rows: 4,
      },
      {
        name: "description",
        label: "Description / Additional Information",
        type: "textarea",
        rows: 4,
      },
      {
        name: "attachment",
        label: "Evidence Attachment",
        type: "file",
        optional: true,
      },
    ],
    phishing: [
      { name: "domainName", label: "Domain Name", type: "text" },
      { name: "phishingUrl", label: "Phishing URL", type: "text" },
      {
        name: "legitimateOrg",
        label: "Legitimate Organization Being Impersonated",
        type: "text",
      },
      {
        name: "description",
        label: "Description of the Phishing Activity",
        type: "textarea",
        rows: 4,
      },
      {
        name: "attachment",
        label: "Screenshots / Evidence",
        type: "file",
        optional: true,
      },
      {
        name: "additionalInfo",
        label: "Additional Information",
        type: "textarea",
        rows: 4,
        optional: true,
      },
    ],
    copyright: [
      { name: "domainName", label: "Domain Name", type: "text" },
      { name: "copyrightOwner", label: "Copyright Owner Name", type: "text" },
      {
        name: "originalUrl",
        label: "Original Copyrighted Work URL",
        type: "text",
      },
      {
        name: "infringingUrl",
        label: "Infringing Content URL(s)",
        type: "textarea",
        rows: 2,
      },
      {
        name: "description",
        label: "Description of Copyright Violation",
        type: "textarea",
        rows: 4,
      },
      {
        name: "attachment",
        label: "Evidence Attachment",
        type: "file",
        optional: true,
      },
      { name: "goodFaith", label: "Good Faith Declaration", type: "text" },
      {
        name: "electronicSignature",
        label: "Electronic Signature",
        type: "text",
      },
    ],
    "trademark-cybersquatting": [
      { name: "domainName", label: "Domain Name", type: "text" },
      { name: "trademarkName", label: "Trademark Name", type: "text" },
      {
        name: "registrationNumber",
        label: "Trademark Registration Number",
        type: "text",
      },
      { name: "jurisdiction", label: "Jurisdiction / Country", type: "text" },
      {
        name: "officialWebsite",
        label: "Official Trademark Website",
        type: "text",
      },
      {
        name: "explanation",
        label: "Explanation of Cybersquatting",
        type: "textarea",
        rows: 4,
      },
      {
        name: "attachment",
        label: "Supporting Evidence",
        type: "file",
        optional: true,
      },
      {
        name: "desiredOutcome",
        label: "Desired Outcome",
        type: "textarea",
        rows: 2,
      },
    ],
    "trademark-infringement": [
      { name: "domainName", label: "Domain Name", type: "text" },
      { name: "trademarkName", label: "Trademark Name", type: "text" },
      {
        name: "registrationNumber",
        label: "Trademark Registration Number",
        type: "text",
      },
      { name: "jurisdiction", label: "Trademark Jurisdiction", type: "text" },
      {
        name: "officialWebsite",
        label: "Official Trademark Website",
        type: "text",
      },
      {
        name: "originalUrl",
        label: "Original URL (copyright/trademark holder)",
        type: "text",
      },
      {
        name: "specificUrls",
        label: "Specific URL(s)",
        type: "textarea",
        rows: 2,
      },
      {
        name: "attachment",
        label: "Screenshot or Other Evidence of the Infringing Content",
        type: "file",
        optional: true,
      },
      {
        name: "description",
        label: "Description of Trademark Misuse",
        type: "textarea",
        rows: 4,
      },
      {
        name: "proofOfOwnership",
        label: "Proof of Trademark Ownership",
        type: "file",
      },
      {
        name: "desiredOutcome",
        label: "Desired Outcome",
        type: "textarea",
        rows: 2,
        optional: true,
      },
    ],
    "child-abuse": [
      { name: "domainName", label: "Domain Name", type: "text" },
      {
        name: "urls",
        label: "URL(s) Containing Content",
        type: "textarea",
        rows: 2,
      },
      { name: "description", label: "Description", type: "textarea", rows: 4 },
      { name: "attachment", label: "Evidence", type: "file", optional: true },
      {
        name: "lawEnforcement",
        label: "Law Enforcement Reference Number",
        type: "text",
        optional: true,
      },
      {
        name: "additionalInfo",
        label: "Additional Information",
        type: "textarea",
        rows: 4,
        optional: true,
      },
    ],
    "non-consensual-explicit": [
      { name: "domainName", label: "Domain Name", type: "text" },
      { name: "urls", label: "URL(s)", type: "textarea", rows: 2 },
      {
        name: "victimName",
        label: "Victim Name (if applicable)",
        type: "text",
        optional: true,
      },
      {
        name: "description",
        label: "Description of Content",
        type: "textarea",
        rows: 4,
      },
      {
        name: "attachment",
        label: "Evidence / Screenshots",
        type: "file",
        optional: true,
      },
      {
        name: "courtOrder",
        label: "Court Order or Legal Documentation",
        type: "file",
        optional: true,
      },
      { name: "requestedAction", label: "Requested Action", type: "text" },
    ],
    "illegal-pharmacy": [
      { name: "domainName", label: "Domain Name", type: "text" },
      { name: "websiteUrl", label: "Website URL", type: "text" },
      {
        name: "products",
        label: "Product(s) Being Sold",
        type: "textarea",
        rows: 2,
      },
      {
        name: "regulatoryConcern",
        label: "Regulatory Concern",
        type: "textarea",
        rows: 4,
      },
      {
        name: "attachment",
        label: "Supporting Evidence",
        type: "file",
        optional: true,
      },
      {
        name: "governmentRef",
        label: "Government / Agency Reference",
        type: "text",
        optional: true,
      },
      {
        name: "additionalInfo",
        label: "Additional Details",
        type: "textarea",
        rows: 4,
        optional: true,
      },
    ],
    "fake-whois": [
      { name: "domainName", label: "Domain Name", type: "text" },
      {
        name: "suspectedWhois",
        label: "Suspected Incorrect WHOIS Information",
        type: "textarea",
        rows: 4,
      },
      {
        name: "correctWhois",
        label: "Correct Information (if known)",
        type: "textarea",
        rows: 4,
        optional: true,
      },
      { name: "attachment", label: "Evidence", type: "file", optional: true },
      { name: "explanation", label: "Explanation", type: "textarea", rows: 4 },
    ],
    defamation: [
      { name: "domainName", label: "Domain Name", type: "text" },
      { name: "urls", label: "URL(s)", type: "textarea", rows: 2 },
      {
        name: "description",
        label: "Defamatory Content Description",
        type: "textarea",
        rows: 4,
      },
      { name: "attachment", label: "Evidence", type: "file", optional: true },
      {
        name: "courtOrder",
        label: "Court Order (if any)",
        type: "file",
        optional: true,
      },
      { name: "requestedAction", label: "Requested Action", type: "text" },
    ],
    "malware-and-botnet": [
      { name: "domainName", label: "Domain Name", type: "text" },
      { name: "urls", label: "Affected URL(s)", type: "textarea", rows: 2 },
      { name: "malwareType", label: "Malware Type", type: "text" },
      {
        name: "ioc",
        label: "Indicators of Compromise (IOC)",
        type: "textarea",
        rows: 4,
      },
      {
        name: "attachment",
        label: "Evidence / Logs",
        type: "file",
        optional: true,
      },
      {
        name: "securityReport",
        label: "Security Report Attachment",
        type: "file",
        optional: true,
      },
      {
        name: "additionalInfo",
        label: "Additional Information",
        type: "textarea",
        rows: 4,
        optional: true,
      },
    ],
  };

  return (
    <div className="pt-[150px] pb-[100px] min-h-screen width relative z-10">
      <div className="width bg-bgdark p-6 sm:p-10 rounded-xl">
        {/* Header Banner */}
        <div className="bg-blue-50/10 border border-blue-500/30 rounded-lg p-4 flex items-center justify-between mb-8">
          <h1 className="text-white aabbss font-bold text-[24px]">
            Report Abuse
          </h1>
          <FaShieldAlt className="text-greencolor text-[24px]" />
        </div>

        {/* Intro Text */}
        <div className="space-y-4 text-gray-300 aabbss text-[14px] leading-relaxed mb-10">
          <p>
            <span className="text-greencolor font-bold">
              Mk Timothy & Company
            </span>{" "}
            is dedicated to addressing abuse complaints efficiently and
            transparently. If you have identified a user or entity exhibiting
            abusive behavior, please provide detailed and accurate evidence when
            submitting your complaint. Submitting insufficient or unclear
            information may result in delays during the investigation. Due to
            the high volume of complaints we receive, we may only contact you if
            additional details are needed.
          </p>
          <p>
            To expedite the resolution process, please select the type of abuse
            from the dropdown menu below and complete the corresponding form
            with as much specificity as possible.
          </p>
          <p>
            Abuse encompasses activities such as malware distribution, botnets,
            phishing, pharming, and spam (when used to deliver other forms of
            abuse). Your vigilance helps us maintain a safer platform for
            everyone.
          </p>
        </div>

        {/* Dropdown Selection */}
        <div className="mb-10 text-center">
          <label className="block text-white aabbss text-[16px] mb-4">
            Select a form from the dropdown below to report an issue:
          </label>
          <div className="max-w-[800px] mx-auto relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full h-[50px] bg-transparent border border-gray-500 rounded-[8px] px-[20px] text-white aabbss text-[16px] appearance-none cursor-pointer focus:border-greencolor focus:outline-none"
            >
              <option value="" className="bg-bgdark">
                Select an abuse type
              </option>
              {abuseTypes.map((type) => (
                <option
                  key={type.value}
                  value={type.value}
                  className="bg-bgdark"
                >
                  {type.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Dynamic Form based on Selection */}
        {selectedType && (
          <div className="animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-white aabbss font-bold text-[24px] mb-4">
                {abuseTypes.find((t) => t.value === selectedType)?.label} Abuse
                Report
              </h2>
              <div className="text-left space-y-4 text-gray-300 aabbss text-[14px]">
                <div>
                  <h3 className="text-white font-bold mb-1">
                    Reporting{" "}
                    {abuseTypes.find((t) => t.value === selectedType)?.label}
                  </h3>
                  <p>
                    Please provide detailed and accurate evidence when
                    submitting your complaint. Submitting insufficient or
                    unclear information may result in delays during the
                    investigation. Our abuse team investigates all valid
                    complaints thoroughly.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-bglight p-6 sm:p-8 rounded-xl border border-lightgray relative"
            >
              {statusMessage && (
                <div
                  className={`mb-6 p-4 rounded-lg text-[14px] ${statusMessage.type === "success" ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}
                >
                  {statusMessage.text}
                </div>
              )}

              <h3 className="text-white aabbss font-bold text-[20px] mb-6 border-b border-lightgray pb-2">
                General Information
              </h3>

              <div className="space-y-5 mb-8">
                <div>
                  <label className="block text-white aabbss text-[14px] mb-2">
                    Full Name
                  </label>
                  <input
                    name="fullName"
                    required
                    type="text"
                    placeholder="Enter your Full Name"
                    className="w-full h-[45px] bg-transparent border border-gray-600 rounded-[8px] px-4 text-white aabbss text-[14px] focus:border-greencolor focus:outline-none placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-white aabbss text-[14px] mb-2">
                    Email
                  </label>
                  <input
                    name="email"
                    required
                    type="email"
                    placeholder="Enter your Email Address"
                    className="w-full h-[45px] bg-transparent border border-gray-600 rounded-[8px] px-4 text-white aabbss text-[14px] focus:border-greencolor focus:outline-none placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-white aabbss text-[14px] mb-2">
                    Confirm Email
                  </label>
                  <input
                    name="confirmEmail"
                    required
                    type="email"
                    placeholder="Confirm your Email Address"
                    className="w-full h-[45px] bg-transparent border border-gray-600 rounded-[8px] px-4 text-white aabbss text-[14px] focus:border-greencolor focus:outline-none placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-white aabbss text-[14px] mb-2">
                    Phone Number{" "}
                    <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className="w-full h-[45px] bg-transparent border border-gray-600 rounded-[8px] px-4 text-white aabbss text-[14px] focus:border-greencolor focus:outline-none placeholder-gray-500"
                  />
                </div>
              </div>

              <h3 className="text-white aabbss font-bold text-[20px] mb-6 border-b border-lightgray pb-2">
                Case Details
              </h3>

              <div className="space-y-5 mb-8">
                {reportFieldsConfig[selectedType]?.map((field) => (
                  <div key={field.name}>
                    <label className="block text-white aabbss text-[14px] mb-2">
                      {field.label}{" "}
                      {field.optional && (
                        <span className="text-gray-500">(Optional)</span>
                      )}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        required={!field.optional}
                        rows={field.rows || 4}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="w-full bg-transparent border border-gray-600 rounded-[8px] p-4 text-white aabbss text-[14px] focus:border-greencolor focus:outline-none placeholder-gray-500 resize-none"
                      ></textarea>
                    ) : field.type === "file" ? (
                      <>
                        <p className="text-gray-500 text-[12px] mb-2">
                          Upload any relevant documents or screenshots - [ .png,
                          .jpeg, .jpg, .pdf - Maximum size: 2 MB ]
                        </p>
                        <input
                          name={field.name}
                          type="file"
                          required={!field.optional}
                          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-greencolor file:text-white hover:file:bg-greencolor/90 cursor-pointer"
                        />
                      </>
                    ) : (
                      <input
                        name={field.name}
                        type={field.type}
                        required={!field.optional}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="w-full h-[45px] bg-transparent border border-gray-600 rounded-[8px] px-4 text-white aabbss text-[14px] focus:border-greencolor focus:outline-none placeholder-gray-500"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  text={isSubmitting ? "Submitting..." : "Submit"}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto min-w-[200px]"
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
