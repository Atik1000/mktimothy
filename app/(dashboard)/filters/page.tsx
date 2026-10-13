"use client";

import AddFilterModal from "@/components/filter/AddFilterModal";
import { useState } from "react";
import { IoChevronUp, IoClose, IoEye, IoEyeOff } from "react-icons/io5";
import { TiPlus } from "react-icons/ti";

interface FilterOption {
  id: string;
  label: string;
  selected: boolean;
  visible: boolean;
}

interface FilterSection {
  id: string;
  title: string;
  expanded: boolean;
  options?: FilterOption[];
}

export default function FiltersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterSections, setFilterSections] = useState<FilterSection[]>([
    {
      id: "stops",
      title: "Stops",
      expanded: true,
      options: [
        { id: "any-stop", label: "Any Stop", selected: true, visible: false },
        {
          id: "one-stop",
          label: "Up to one stop",
          selected: false,
          visible: true,
        },
        {
          id: "nonstop",
          label: "Nonstop Only",
          selected: false,
          visible: true,
        },
      ],
    },
    {
      id: "budget",
      title: "Budget",
      expanded: false,
      options: [
        {
          id: "any-budget",
          label: "Any Budget",
          selected: true,
          visible: false,
        },
        {
          id: "budget-100",
          label: "Less than $100",
          selected: false,
          visible: true,
        },
      ],
    },
    {
      id: "duration",
      title: "Duration",
      expanded: false,
    },
    {
      id: "trip-type",
      title: "Type of trip",
      expanded: false,
    },
  ]);

  const toggleSection = (sectionId: string) => {
    setFilterSections((prev) =>
      prev.map((section) => {
        if (section.id === sectionId) {
          // Toggle the clicked section
          return { ...section, expanded: !section.expanded };
        } else {
          // Close all other sections (accordion behavior)
          return { ...section, expanded: false };
        }
      })
    );
  };

  const toggleOptionVisibility = (sectionId: string, optionId: string) => {
    setFilterSections((prev) =>
      prev.map((section) =>
        section.id === sectionId && section.options
          ? {
              ...section,
              options: section.options.map((option) =>
                option.id === optionId
                  ? { ...option, visible: !option.visible }
                  : option
              ),
            }
          : section
      )
    );
  };

  const removeOption = (sectionId: string, optionId: string) => {
    setFilterSections((prev) =>
      prev.map((section) =>
        section.id === sectionId && section.options
          ? {
              ...section,
              options: section.options.filter(
                (option) => option.id !== optionId
              ),
            }
          : section
      )
    );
  };

  return (
    <div className="flex w-full h-full text-white aabbss">
      {/* Main Content */}
      <div className="p-8 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 mt-4">
          <h1 className="text-white font-bold text-[32px] leading-5">
            Filters
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-4 bg-greencolor text-white px-4 py-2 rounded-md hover:bg-greencolor/90 transition-colors"
          >
            <TiPlus className="w-[20px] h-[20px] text-white" />
            <span>Add Filter</span>
          </button>
        </div>

        {/* Filter Container */}
        <div className="bg-bgdark p-5 px-10 rounded-xl">
          {filterSections.map((section, index) => (
            <div key={section.id}>
              {/* Section Header */}
              <div className="flex items-center justify-between py-10">
                <h3 className="text-white aabbss font-bold text-[20px] ">
                  {section.title}
                </h3>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="transition-all duration-300 ease-in-out text-white hover:text-greencolor"
                  style={{
                    transform: section.expanded
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                >
                  <IoChevronUp className="w-[27px] h-[27px]" />
                </button>
              </div>

              {/* Section Options with Smooth Animation */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  section.expanded
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                {section.options && (
                  <div className="pb-[40px]">
                    {section.options.map((option, optionIndex) => (
                      <div
                        key={option.id}
                        className={`flex items-center justify-between py-[13px] transition-all duration-300 ease-in-out transform ${
                          section.expanded
                            ? "translate-y-0 opacity-100"
                            : "-translate-y-2 opacity-0"
                        }`}
                        style={{
                          transitionDelay: section.expanded
                            ? `${optionIndex * 100}ms`
                            : "0ms",
                        }}
                      >
                        <p className="text-white aabbss font-normal text-[20px] leading-[27.28px] pl-[0px]">
                          {option.label}
                        </p>
                        <div className="flex items-center gap-[25px]">
                          {/* Remove Button */}
                          <button
                            onClick={() => removeOption(section.id, option.id)}
                            className="text-white hover:text-red-400 transition-colors duration-200"
                          >
                            <IoClose className="w-[25px] h-[25px]" />
                          </button>

                          {/* Visibility Toggle */}
                          <button
                            onClick={() =>
                              toggleOptionVisibility(section.id, option.id)
                            }
                            className="text-white hover:text-greencolor transition-colors duration-200"
                          >
                            {option.visible ? (
                              <IoEye className="w-[25px] h-[25px]" />
                            ) : (
                              <IoEyeOff className="w-[25px] h-[25px]" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Separator Line */}
              {index < filterSections.length - 1 && (
                <div className="w-full h-[0.5px] bg-[#4A4A4A]" />
              )}
            </div>
          ))}
        </div>
      </div>
      <AddFilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
