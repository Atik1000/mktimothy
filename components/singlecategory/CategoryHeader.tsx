interface CategoryHeaderProps {
  title: string;
  description: string;
}

const CategoryHeader = ({ title, description }: CategoryHeaderProps) => {
  return (
    <div className="pt-28 md:pt-[150px] pb-20 md:pb-[100px]">
      <div className="width">
        <h1 className="text-white aabbss font-bold text-[24px] md:text-[32px]  mb-3 md:mb-[15px]">
          {title}
        </h1>
        <p className="text-white aabbss text-[16px] md:text-[20px] max-w-[1280px]">
          {description}
        </p>
      </div>
    </div>
  );
};

export default CategoryHeader;
