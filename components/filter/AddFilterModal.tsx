"use client";

import { useState } from "react";
import { TiTimes } from "react-icons/ti";

interface AddFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddFilterModal = ({ isOpen, onClose }: AddFilterModalProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("Public");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [timeFormat, setTimeFormat] = useState("AM");

  const handleExpandToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handlePublish = () => {
    console.log("Publishing blog...");
    onClose();
  };

  const handleSchedule = () => {
    console.log("Scheduling blog...");
    onClose();
  };

  if (!isOpen) return null;
  const icons = [
    "/images/ico1.png",
    "/images/ico2.png",
    "/images/ico3.png",
    "/images/ico4.png",
    "/images/ico5.png",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bgdark border border-white/20 rounded-xl p-6 w-[90%] max-w-[700px] h-[60vh] overflow-y-auto flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-[24px] font-bold aabbuu">
              Create a new filter
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <TiTimes className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div>
          {/* Type of trip dropdown */}
          <div className="mb-6">
            <select className="w-full bg-bgdark border-b border-white/20 px-4 py-3 text-white aabbss text-[16px] focus:outline-none focus:border-greencolor e cursor-pointer">
              <option value="">Type of trip</option>
              <option value="business">Business</option>
              <option value="leisure">Leisure</option>
              <option value="family">Family</option>
            </select>
          </div>

          {/* Foodie input */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Foodie"
              className="w-full bg-bgdark border-b border-white/20  px-4 py-3 text-white aabbss text-[16px] placeholder-white/70 focus:outline-none focus:border-greencolor"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={handlePublish}
            className="bg-greencolor text-white px-6 py-2 rounded-lg hover:bg-greencolor/90 transition-colors aabbss"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFilterModal;
