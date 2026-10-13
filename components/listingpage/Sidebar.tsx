"use client";

interface SidebarProps {
  selectedFilters: {
    stops: string;
    budget: number;
    duration: number;
    tripType: string;
  };
  setSelectedFilters: (filters: any) => void;
}

export default function Sidebar({
  selectedFilters,
  setSelectedFilters,
}: SidebarProps) {
  const handleStopsChange = (value: string) => {
    setSelectedFilters({
      ...selectedFilters,
      stops: value,
    });
  };

  const handleBudgetChange = (value: number) => {
    setSelectedFilters({
      ...selectedFilters,
      budget: value,
    });
  };

  const handleDurationChange = (value: number) => {
    setSelectedFilters({
      ...selectedFilters,
      duration: value,
    });
  };

  const handleTripTypeChange = (value: string) => {
    setSelectedFilters({
      ...selectedFilters,
      tripType: value,
    });
  };

  return (
    <div className="w-[230px] lg:w-[260px] bg-bgdark py-[30px] px-[30px] flex flex-col flex-grow flex-1 sticky top-0 flex-shrink-0">
      {/* Stops */}
      <div className="mb-[50px]">
        <h3 className="text-white aabbss font-bold text-[18px] leading-[25px] mb-[20px]">
          Stops
        </h3>
        <div className="space-y-[12px]">
          {[
            { id: "any", label: "Any stops" },
            { id: "one", label: "Up to one stop" },
            { id: "nonstop", label: "Nonstop only" },
          ].map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-[12px] cursor-pointer"
              onClick={() => handleStopsChange(item.id)}
            >
              <div
                className={`w-[16px] h-[16px] rounded-full border-2 ${
                  selectedFilters.stops === item.id
                    ? "border-greencolor"
                    : "border-gray-500"
                } flex items-center justify-center`}
              >
                {selectedFilters.stops === item.id && (
                  <div className="w-[8px] h-[8px] bg-greencolor rounded-full" />
                )}
              </div>
              <span className="text-white aabbss text-[14px] leading-[19px]">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="mb-[50px]">
        <h3 className="text-white aabbss font-bold text-[18px] leading-[25px] mb-[20px]">
          Budget
        </h3>
        <div className="relative">
          <div className="w-full h-[4px] bg-gray-600 rounded-full cursor-pointer">
            <div
              className="h-full bg-greencolor rounded-full relative"
              style={{ width: `${selectedFilters.budget}%` }}
            >
              <div
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-[12px] h-[12px] bg-greencolor rounded-full border-2 border-white cursor-pointer"
                onMouseDown={(e) => {
                  const startX = e.clientX;
                  const startValue = selectedFilters.budget;

                  const handleMouseMove = (e: MouseEvent) => {
                    const diff = e.clientX - startX;
                    const newValue = Math.max(
                      0,
                      Math.min(100, startValue + diff / 2)
                    );
                    handleBudgetChange(newValue);
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener("mousemove", handleMouseMove);
                    document.removeEventListener("mouseup", handleMouseUp);
                  };

                  document.addEventListener("mousemove", handleMouseMove);
                  document.addEventListener("mouseup", handleMouseUp);
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Duration */}
      <div className="mb-[50px]">
        <h3 className="text-white aabbss font-bold text-[18px] leading-[25px] mb-[20px]">
          Duration
        </h3>
        <div className="relative">
          <div className="w-full h-[4px] bg-gray-600 rounded-full cursor-pointer">
            <div
              className="h-full bg-greencolor rounded-full relative"
              style={{ width: `${selectedFilters.duration}%` }}
            >
              <div
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-[12px] h-[12px] bg-greencolor rounded-full border-2 border-white cursor-pointer"
                onMouseDown={(e) => {
                  const startX = e.clientX;
                  const startValue = selectedFilters.duration;

                  const handleMouseMove = (e: MouseEvent) => {
                    const diff = e.clientX - startX;
                    const newValue = Math.max(
                      0,
                      Math.min(100, startValue + diff / 2)
                    );
                    handleDurationChange(newValue);
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener("mousemove", handleMouseMove);
                    document.removeEventListener("mouseup", handleMouseUp);
                  };

                  document.addEventListener("mousemove", handleMouseMove);
                  document.addEventListener("mouseup", handleMouseUp);
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Type of trip */}
      <div>
        <h3 className="text-white aabbss font-bold text-[18px] leading-[25px] mb-[20px]">
          Type of trip
        </h3>
        <div className="space-y-[12px]">
          {[
            { id: "anything", label: "Anything" },
            { id: "city", label: "City" },
            { id: "beach", label: "Beach" },
            { id: "family", label: "Family" },
            { id: "romantic", label: "Romantic" },
            { id: "outdoorsy", label: "Outdoorsy" },
            { id: "foodie", label: "Foodie" },
            { id: "skiing", label: "Skiing" },
          ].map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-[12px] cursor-pointer"
              onClick={() => handleTripTypeChange(item.id)}
            >
              <div
                className={`w-[16px] h-[16px] rounded-full border-2 ${
                  selectedFilters.tripType === item.id
                    ? "border-greencolor"
                    : "border-gray-500"
                } flex items-center justify-center`}
              >
                {selectedFilters.tripType === item.id && (
                  <div className="w-[8px] h-[8px] bg-greencolor rounded-full" />
                )}
              </div>
              <span className="text-white aabbss text-[14px] leading-[19px]">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
