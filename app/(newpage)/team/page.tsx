"use client";

import useNewpageEngine from "@/lib/hooks/useNewpageEngine";
import NewpageMenuHeader from "@/components/newpage/NewpageMenuHeader";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const page = () => {
  const router = useRouter();
  const handleNavigation = (href: string) => {
    window.location.href = href;
  };
  const handleNavigation2 = (href: string) => {
    window.location.replace(href);
  };
  const handleMem = (href: string) => {
    router.push(href);
  };
  useNewpageEngine();

  useEffect(() => {
    const handleCaptureClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const a = target.closest("a");
      if (a && a.href && a.pathname.startsWith("/team/")) {
        e.preventDefault();
        e.stopPropagation();
        window.location.assign(a.href);
      }
    };
    window.addEventListener("click", handleCaptureClick, true);
    return () => window.removeEventListener("click", handleCaptureClick, true);
  }, []);

  return (
    <div>
      <div>
        <div
          id="loader"
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            background: "#90bd0b",
            zIndex: "10000",
          }}
          data-component="Loader"
        >
          <div
            className="pixi-wrapper"
            style={{ position: "absolute", visibility: "hidden" }}
          >
            <div data-component="LoaderPixiView"></div>
          </div>
          <div
            className="q-tail-orange-wrapper"
            style={{ position: "absolute", visibility: "hidden" }}
          >
            <div data-component="QTail" data-size="0.26"></div>
          </div>
        </div>
        <div
          id="interloader"
          className="fixed top-0 left-0 w-full h-full z-50 items-center justify-center hidden"
          data-component="Interloader"
        >
          <div className="absolute inset-0 bg-purple"></div>
          <div className="relative w-1/2 max-w-screen-sm">
            <div className="w-full" data-component="QCircle"></div>
            <div
              className="absolute top-1/2 left-1/2 w-1/2 h-1/2"
              data-component="QTail"
            ></div>
          </div>
        </div>
        <div id="root">
          <div
            className="relative h-screen w-full overflow-hidden is-fullscreen"
            data-component="Team"
          >
            {/* ////////////////////GRIDDDDDDDDDDDD/////////////////// */}
            <div className="w-full h-full bg-purple" data-component="TeamGrid">
              <a
                className="item hidden"
                href="/team/mktimothy"
                
                data-name="MK Timothy"
                data-role="Founder"
                data-office="Uganda"
                data-picture="/images/mktimothy.jpg"
                data-id="mk-timothy-unique-id"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/sandra"
                
                data-name="Sandra"
                data-role="Partner"
                data-office="Uganda"
                data-picture="/images/sandra.jpeg"
                data-id="6df421b01d0419955b3ac269b2b59dea89f5fff8"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/tasha"
                
                data-name="Tasha Mugisha"
                data-role="Partner, Tourism & Hospitality Investment"
                data-office="Uganda"
                data-picture="/images/tashamugisha.jpg"
                data-id="tasha-mugisha-unique-id"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/alemi"
                
                data-name="Alemi James"
                data-role="Automotive, Real Estate & International Trade Partner"
                data-office="Uganda"
                data-picture="/images/alemijames.jpg"
                data-id="alemi-james-unique-id"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/madhukrishan"
                
                data-name="Madhu Krishan"
                data-role="Strategic Global Partner"
                data-office="Global"
                data-picture="/images/madhukrishan.jpg"
                data-id="madhu-krishan-unique-id"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/stella"
                
                data-name="Stella"
                data-role="Operations Lead"
                data-office="Uganda"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/78276d44230aadf750b8119dd04d614e856fd51b-1000x1000.jpg"
                data-id="53da0a17-8c32-49a4-8d8a-ab263a87cd21"
              ></a>
              {/*///////////////////////////////////////////////////////////////// **/}
              <a
                className="item hidden"
                href="/team/mateo"
                
                data-name="Mateo"
                data-role="Analytics Lead"
                data-office="Uganda"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/beebb32457f3a27afb27dfd060b461fc11a96919-1000x1000.jpg"
                data-id="210401b7-856d-4387-93bf-4ad2cfb1dd1f"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/mila"
                
                data-name="Mila"
                data-role="Partner"
                data-office="Uganda"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/7fd5f25e701e93e0f402efe0a10d135510b889c9-1000x1000.jpg"
                data-id="c104b4e0-270a-491d-8c59-28b4ca21dfc4"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/zoey"
                
                data-name="Zoey"
                data-role="Team Coordinator"
                data-office="South Africa"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/6c05733cf79cd286fd919933487168f4895ada7d-433x552.jpg"
                data-id="769a3d38-45c4-4dd3-9ed6-6e5273d42c7c"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/emma"
                
                data-name="Emma"
                data-role="Operating Partner"
                data-office="South Africa"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/e3648464ad1167efbba189daaaf76491b5236166-1211x1211.jpg"
                data-id="f1c19227-a2fe-4376-8cc8-d4421284d865"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/hannah"
                
                data-name="Hannah"
                data-role="Team Coordinator"
                data-office="Kenya"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/cf50ab29554422ad6a0223ee54e7c56b5164a9db-2392x2392.jpg"
                data-id="c10037ad-b930-4194-8731-53fc29444e66"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/sophia"
                
                data-name="Sophia"
                data-role="Partner"
                data-office="South Sudan"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/3bb52f4afffd860159e97f9de780030a51b3c8d2-1000x1000.jpg"
                data-id="9dd09c9b-efcf-4a46-baba-8d0a343448cc"
              ></a>

              <a
                className="item hidden"
                href="/team/logan"
                
                data-name="Logan"
                data-role="Operating Partner, Business &amp; Corporate Development"
                data-office="Japan"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/fae42324564549d6af7f90dba72a3c53e1548205-1603x1600.jpg"
                data-id="e3f41551-a35c-4533-ba1f-4132b088712c"
              ></a>
              {/* ////////////////////////////////////////push////---///////////////////// */}
              <a
                className="item hidden"
                href="/team/william"
                
                data-name="William"
                data-role="Venture Lead"
                data-office="Uganda"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/1b3c289d499b9b243ad3e2a4447862f7469ae488-916x1280.jpg"
                data-id="79a9cfc6-8780-4de0-8b1c-d65783c3f3c5"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/charlotte"
                
                data-name="Charlotte"
                data-role="Venture Lead"
                data-office="South Sudan"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/bbc26d75e00bc763936f819c5823dcff8beeb821-1000x1000.jpg"
                data-id="ae8cac55-5d5c-4d2a-bafd-442266a65d31"
              ></a>

              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/luca"
                
                data-name="Luca"
                data-role="Partner"
                data-office="Uganda"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/67603d565296249d2c7e22f47077076b2e9a033a-588x680.jpg"
                data-id="43c45a7b-790c-4e8a-b6c3-58b7e3647795"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/arianna"
                
                data-name="Arianna"
                data-role="Partner"
                data-office="Japan"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/7fd5ea378dd634a9d784b912e4d4378e416ef600-1000x1000.jpg"
                data-id="e9d171c4-9164-4d51-9ca6-ab11f26cd2b3"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/victoria"
                
                data-name="Victoria"
                data-role="Team Coordinator"
                data-office="South Sudan"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/2985d3b280354e730f5c955ccc8fde186c52cef8-408x408.jpg"
                data-id="08f1c5e6-6bcf-4927-a66d-392f996b3c5e"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/jacob"
                
                data-name="Jacob"
                data-role="Operating Partner"
                data-office="Amsterdam"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/6938de4f0d91cbdff44d66f7ad08397bae4fe5a8-1000x1000.jpg"
                data-id="b54af716-ad51-44b1-a85f-02068958738f"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/noah"
                
                data-name="Noah"
                data-role="Operating Partner"
                data-office="Kenya"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/d1be4a94b63aa9070f7e006b881a7fd623fde3a8-3000x3000.jpg"
                data-id="f357721b-6551-4de6-b43a-ff338c46e640"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/grayson"
                
                data-name="Grayson"
                data-role="Operating Partner Analytics"
                data-office="Uganda"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/34b8a3847e68552550a375763e7cdea84575dbef-1999x1804.jpg"
                data-id="01b4485b-9bdb-43ec-ab6d-543e87046b8c"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/chloe"
                
                data-name="Chloe"
                data-role="Team Coordinator"
                data-office="Uganda"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/38d037cfcb7ead37c0328c9faa3b9c608e56d79f-1000x1000.jpg"
                data-id="8a48b378-8c47-4b01-a6fe-d033a6ddada2"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/mason"
                
                data-name="Mason"
                data-role="Venture Lead"
                data-office="Kenya"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/3d58a030165bbae4b904ec2e9ff9d30a5d3683e7-1000x1000.jpg"
                data-id="44fc84f6-5c2c-4053-b956-0595dc416ce5"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/benjamin"
                
                data-name="Benjamin"
                data-role="Tech Analyst"
                data-office="South Africa"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/933c228e2528ea4717df297adac1c800baad997f-500x500.jpg"
                data-id="066c3806-5eba-47f8-a0bd-b384261a1125"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/umutesi"
                
                data-name="Beatrice"
                data-role="Partner"
                data-office="South Africa"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/c7e631585d2bba80fd2c6383bfeb76da87dcf2dd-1000x1000.jpg"
                data-id="0a0004b6-fc0a-4ad7-bed7-46f5f0afe609"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/ethan"
                
                data-name="Ethan"
                data-role="Venture Analyst"
                data-office="Uganda"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/7bb964a17cbe65f01667f774fb7750175324ee89-547x547.jpg"
                data-id="0eaacf05-e2a7-4dd3-b904-50f45bf9f02d"
              ></a>

              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/henry"
                data-name="Theodore"
                data-role="Partner"
                data-office="Uganda"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/d9de592d419e82fb16dce0707f375de994b772bb-1000x1000.jpg"
                data-id="81591c66-babe-4144-af3f-65ec49208aa6"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/amelia"
                data-name="Amelia"
                data-role="Partner"
                data-office="Uganda"
                data-picture="https://cdn.sanity.io/images/doauu19r/production/d9de592d419e82fb16dce0707f375de994b772bb-1000x1000.jpg"
                data-id="d28caa04-ee45-47c1-b9f8-d8a93e421390"
              ></a>
              {/* ///////////////////////////////////////////////////////////////// */}
              <a
                className="item hidden"
                href="/team/tatu"
                data-name="Tatu"
                data-role="Sales and Distribution Professional"
                data-office="Uganda"
                data-picture="/images/tatu.jpeg"
                data-id="tatu-unique-id"
              ></a>
            </div>
            {/* //////////////////////////////// */}
            {/* ////////////////////////////LIST VIEW//////////////////////////////// */}
            <div
              className="list-view text-white absolute inset-0 overflow-hidden hidden select-none"
              data-component="ListView"
            >
              <div className="background absolute gradient inset-0"></div>
              <div className="relative container sm-only:max-w-xs mx-auto px-4 sm:px-60 h-full">
                <div className="scrollpane relative w-full">
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/mktimothy"
                    
                    data-name="MK Timothy"
                    data-role="Founder"
                    data-office="Uganda"
                    data-picture="/images/mktimothy.jpg"
                    data-id="mk-timothy-unique-id"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        MK Timothy
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Founder -
                        <span className="italic font-light">Uganda</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    // onClick={() => handleNavigation2("/team/adalynn")}
                    href="/team/sandra"
                    
                    data-name="Sandra"
                    data-role="Uganda"
                    data-office="Japan"
                    data-picture="/images/sandra.jpeg"
                    data-id="6df421b01d0419955b3ac269b2b59dea89f5fff8"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Sandra
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Partner -
                        <span className="italic font-light">Uganda</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    // onClick={() => handleNavigation2("/team/adalynn")}
                    href="/team/tasha"
                    
                    data-name="Tasha Mugisha"
                    data-role="Uganda"
                    data-office="Japan"
                    data-picture="/images/tashamugisha.jpg"
                    data-id="tasha-mugisha-unique-id"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Tasha
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Tourism & Hospitality Investment -
                        <span className="italic font-light">Uganda</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/alemi"
                    
                    data-name="Alemi James"
                    data-role="Automotive, Real Estate & International Trade Partner"
                    data-office="Uganda"
                    data-picture="/images/alemijames.jpg"
                    data-id="alemi-james-unique-id"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Alemi
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Automotive, Real Estate & International Trade Partner -
                        <span className="italic font-light">Uganda</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/madhukrishan"
                    
                    data-name="Madhu Krishan"
                    data-role="Strategic Global Partner"
                    data-office="Global"
                    data-picture="/images/madhukrishan.jpg"
                    data-id="madhu-krishan-unique-id"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Madhu
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Strategic Global Partner -
                        <span className="italic font-light">Global</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/stella"
                    
                    data-name="Stella"
                    data-role="Operations Lead"
                    data-office="Uganda"
                    data-picture="https://cdn.sanity.io/images/doauu19r/production/78276d44230aadf750b8119dd04d614e856fd51b-1000x1000.jpg?w=620&amp;h=620&amp;auto=format"
                    data-id="53da0a17-8c32-49a4-8d8a-ab263a87cd21"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Stella
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Operations Lead -
                        <span className="italic font-light">Uganda</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/mateo"
                    
                    data-name="Mateo"
                    data-role="Analytics Lead"
                    data-office="Uganda"
                    data-picture="https://cdn.sanity.io/images/doauu19r/production/beebb32457f3a27afb27dfd060b461fc11a96919-1000x1000.jpg?w=620&amp;h=620&amp;auto=format"
                    data-id="210401b7-856d-4387-93bf-4ad2cfb1dd1f"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Mateo
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Analytics Lead -
                        <span className="italic font-light">Uganda</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/mila"
                    
                    data-name="Mila"
                    data-role="Partner"
                    data-office="Uganda"
                    data-picture="https://cdn.sanity.io/images/doauu19r/production/7fd5f25e701e93e0f402efe0a10d135510b889c9-1000x1000.jpg?w=620&amp;h=620&amp;auto=format"
                    data-id="c104b4e0-270a-491d-8c59-28b4ca21dfc4"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Mila
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Partner -
                        <span className="italic font-light">Uganda</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/amelia"
                    data-name="Amelia"
                    data-role="Partner"
                    data-office="Uganda"
                    data-picture=""
                    data-id="d28caa04-ee45-47c1-b9f8-d8a93e421390"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Amelia
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Partner -
                        <span className="italic font-light">Uganda</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/zoey"
                    
                    data-name="Zoey"
                    data-role="Team Coordinator"
                    data-office="South Africa"
                    data-picture="https://cdn.sanity.io/images/doauu19r/production/6c05733cf79cd286fd919933487168f4895ada7d-433x552.jpg?rect=0,59,433,433&amp;w=620&amp;h=620&amp;auto=format"
                    data-id="769a3d38-45c4-4dd3-9ed6-6e5273d42c7c"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Zoey
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Team Coordinator -
                        <span className="italic font-light">South Africa</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/emma"
                    
                    data-name="Emma"
                    data-role="Operating Partner"
                    data-office="South Africa"
                    data-picture="https://cdn.sanity.io/images/doauu19r/production/e3648464ad1167efbba189daaaf76491b5236166-1211x1211.jpg?w=620&amp;h=620&amp;auto=format"
                    data-id="f1c19227-a2fe-4376-8cc8-d4421284d865"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Emma
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Operating Partner -
                        <span className="italic font-light">South Africa</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/hannah"
                    
                    data-name="Hannah"
                    data-role="Team Coordinator"
                    data-office="Kenya"
                    data-picture="https://cdn.sanity.io/images/doauu19r/production/cf50ab29554422ad6a0223ee54e7c56b5164a9db-2392x2392.jpg?w=620&amp;h=620&amp;auto=format"
                    data-id="c10037ad-b930-4194-8731-53fc29444e66"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Hannah
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Team Coordinator -
                        <span className="italic font-light">Kenya</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/sophia"
                    
                    data-name="Sophia"
                    data-role="Partner"
                    data-office="South Sudan"
                    data-picture="https://cdn.sanity.io/images/doauu19r/production/3bb52f4afffd860159e97f9de780030a51b3c8d2-1000x1000.jpg?w=620&amp;h=620&amp;auto=format"
                    data-id="9dd09c9b-efcf-4a46-baba-8d0a343448cc"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Sophia
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Partner -
                        <span className="italic font-light">South Sudan</span>
                      </span>
                    </span>
                  </a>

                  <a
                    className="item block whitespace-nowrap"
                    href="/team/logan"
                    
                    data-name="Logan"
                    data-role="Operating Partner, Business &amp; Corporate Development"
                    data-office="Japan"
                    data-picture="https://cdn.sanity.io/images/doauu19r/production/fae42324564549d6af7f90dba72a3c53e1548205-1603x1600.jpg?rect=2,0,1600,1600&amp;w=620&amp;h=620&amp;auto=format"
                    data-id="e3f41551-a35c-4533-ba1f-4132b088712c"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Logan
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Operating Partner, Business & Corporate Development -
                        <span className="italic font-light">Japan</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/william"
                    
                    data-name="William"
                    data-role="Venture Lead"
                    data-office="Uganda"
                    data-picture="https://cdn.sanity.io/images/doauu19r/production/1b3c289d499b9b243ad3e2a4447862f7469ae488-916x1280.jpg?rect=67,0,706,706&amp;w=620&amp;h=620&amp;auto=format"
                    data-id="79a9cfc6-8780-4de0-8b1c-d65783c3f3c5"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        William
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Venture Lead -
                        <span className="italic font-light">Uganda</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/charlotte"
                    
                    data-name="Charlotte"
                    data-role="Venture Lead"
                    data-office="South Sudan"
                    data-picture="https://cdn.sanity.io/images/doauu19r/production/bbc26d75e00bc763936f819c5823dcff8beeb821-1000x1000.jpg?w=620&amp;h=620&amp;auto=format"
                    data-id="ae8cac55-5d5c-4d2a-bafd-442266a65d31"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Charlotte
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Venture Lead -
                        <span className="italic font-light">South Sudan</span>
                      </span>
                    </span>
                  </a>

                  <a
                    className="item block whitespace-nowrap"
                    href="/team/luca"
                    
                    data-name="Luca"
                    data-role="Partner"
                    data-office="Uganda"
                    data-picture="https://cdn.sanity.io/images/doauu19r/production/67603d565296249d2c7e22f47077076b2e9a033a-588x680.jpg?rect=0,46,588,588&amp;w=620&amp;h=620&amp;auto=format"
                    data-id="43c45a7b-790c-4e8a-b6c3-58b7e3647795"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Luca
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Partner -
                        <span className="italic font-light">Uganda</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/arianna"
                    
                    data-name="Arianna"
                    data-role="Partner"
                    data-office="Japan"
                    data-picture="https://cdn.sanity.io/images/doauu19r/production/7fd5ea378dd634a9d784b912e4d4378e416ef600-1000x1000.jpg?w=620&amp;h=620&amp;auto=format"
                    data-id="e9d171c4-9164-4d51-9ca6-ab11f26cd2b3"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Arianna
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Partner -
                        <span className="italic font-light">Japan</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/victoria"
                    
                    data-name="Victoria"
                    data-role="Team Coordinator"
                    data-office="South Sudan"
                    data-picture="https://cdn.sanity.io/images/doauu19r/production/2985d3b280354e730f5c955ccc8fde186c52cef8-408x408.jpg?w=620&amp;h=620&amp;auto=format"
                    data-id="08f1c5e6-6bcf-4927-a66d-392f996b3c5e"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Victoria
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Team Coordinator -
                        <span className="italic font-light">South Sudan</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/jacob"
                    
                    data-name="Jacob"
                    data-role="Operating Partner"
                    data-office="Amsterdam"
                    data-picture="https://cdn.sanity.io/images/doauu19r/production/6938de4f0d91cbdff44d66f7ad08397bae4fe5a8-1000x1000.jpg?w=620&amp;h=620&amp;auto=format"
                    data-id="b54af716-ad51-44b1-a85f-02068958738f"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Jacob
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Operating Partner -
                        <span className="italic font-light">Amsterdam</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/noah"
                    
                    data-name="Noah"
                    data-role="Operating Partner"
                    data-office="Kenya"
                    data-picture="https://cdn.sanity.io/images/doauu19r/production/d1be4a94b63aa9070f7e006b881a7fd623fde3a8-3000x3000.jpg?w=620&amp;h=620&amp;auto=format"
                    data-id="f357721b-6551-4de6-b43a-ff338c46e640"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Noah
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Operating Partner -
                        <span className="italic font-light">Kenya</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/grayson"
                    
                    data-name="Grayson"
                    data-role="Operating Partner Analytics"
                    data-office="Uganda"
                    data-picture="https://cdn.sanity.io/images/doauu19r/production/34b8a3847e68552550a375763e7cdea84575dbef-1999x1804.jpg?rect=383,40,1388,1388&amp;w=620&amp;h=620&amp;auto=format"
                    data-id="01b4485b-9bdb-43ec-ab6d-543e87046b8c"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Grayson
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Operating Partner Analytics -
                        <span className="italic font-light">Uganda</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/chloe"
                    
                    data-name="Chloe"
                    data-role="Team Coordinator"
                    data-office="Uganda"
                    data-picture="https://cdn.sanity.io/images/doauu19r/production/38d037cfcb7ead37c0328c9faa3b9c608e56d79f-1000x1000.jpg?w=620&amp;h=620&amp;auto=format"
                    data-id="8a48b378-8c47-4b01-a6fe-d033a6ddada2"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Chloe
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Team Coordinator -
                        <span className="italic font-light">Uganda</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/mason"
                    
                    data-name="Mason"
                    data-role="Venture Lead"
                    data-office="Kenya"
                    data-picture="https://cdn.sanity.io/images/doauu19r/production/3d58a030165bbae4b904ec2e9ff9d30a5d3683e7-1000x1000.jpg?w=620&amp;h=620&amp;auto=format"
                    data-id="44fc84f6-5c2c-4053-b956-0595dc416ce5"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Mason
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Venture Lead -
                        <span className="italic font-light">Kenya</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/benjamin"
                    
                    data-name="Benjamin"
                    data-role="Tech Analyst"
                    data-office="South Africa"
                    data-picture="https://cdn.sanity.io/images/doauu19r/production/933c228e2528ea4717df297adac1c800baad997f-500x500.jpg?w=620&amp;h=620&amp;auto=format"
                    data-id="066c3806-5eba-47f8-a0bd-b384261a1125"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Benjamin
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Tech Analyst -
                        <span className="italic font-light">South Africa</span>
                      </span>
                    </span>
                  </a>

                  <a
                    className="item block whitespace-nowrap"
                    href="/team/umutesi"
                    
                    data-name="Beatrice"
                    data-role="Partner"
                    data-office="South Africa"
                    data-picture="https://cdn.sanity.io/images/doauu19r/production/c7e631585d2bba80fd2c6383bfeb76da87dcf2dd-1000x1000.jpg?w=620&h=620&auto=format"
                    data-id="0a0004b6-fc0a-4ad7-bed7-46f5f0afe609"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Umutesi Tracy
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Partner -
                        <span className="italic font-light">South Africa</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/ethan"
                    
                    data-name="Ethan"
                    data-role="Venture Analyst"
                    data-office="Uganda"
                    data-picture="https://cdn.sanity.io/images/doauu19r/production/7bb964a17cbe65f01667f774fb7750175324ee89-547x547.jpg?w=620&h=620&auto=format"
                    data-id="0eaacf05-e2a7-4dd3-b904-50f45bf9f02d"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Ethan
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Venture Analyst -
                        <span className="italic font-light">Uganda</span>
                      </span>
                    </span>
                  </a>

                  <a
                    className="item block whitespace-nowrap"
                    href="/team/henry"
                    
                    data-name="Theodore"
                    data-role="Partner"
                    data-office="Uganda"
                    data-picture="https://cdn.sanity.io/images/doauu19r/production/d9de592d419e82fb16dce0707f375de994b772bb-1000x1000.jpg?w=620&h=620&auto=format"
                    data-id="81591c66-babe-4144-af3f-65ec49208aa6"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Henry Magandaazi
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Partner -
                        <span className="italic font-light">Uganda</span>
                      </span>
                    </span>
                  </a>
                  <a
                    className="item block whitespace-nowrap"
                    href="/team/tatu"
                    data-name="Tatu"
                    data-role="Sales and Distribution Professional"
                    data-office="Uganda"
                    data-picture="/images/tatu.jpeg"
                    data-id="tatu-unique-id"
                  >
                    <span className="transition-opacity duration-200 ease-linear">
                      <span className="text-40 leading-50 font-bold xl:text-120 xl:leading-120">
                        Tatu
                      </span>
                      <span className="text-16 leading-20 hidden lg:inline lg:ml-10">
                        Sales and Distribution Professional -
                        <span className="italic font-light">Uganda</span>
                      </span>
                    </span>
                  </a>
                </div>
              </div>
              <div className="vignette absolute inset-0 pointer-events-none"></div>
            </div>
            {/* ////////////////////////////////////// */}
            <div className="no-result text-white absolute inset-0 overflow-hidden select-none pointer-events-none opacity-0">
              <div className="relative container sm-only:max-w-xs mx-auto px-4 sm:px-60 h-full flex items-center">
                <p className="transition-all duration-200 text-55 leading-60 text-white font-bold lg:text-110 lg:leading-120">
                  No filter match
                </p>
              </div>
            </div>
            {/* /////////////////////////////////// */}
            <div className="absolute inset-x-0 bottom-10 pointer-events-none">
              <div className="container sm-only:max-w-xs mx-auto px-4 sm:px-16 flex justify-between items-center">
                <div className="ctaCircle tracking-wide uppercase text-13 leading-13 font-bold centeredLabel cta-list text-white pointer-events-auto">
                  <div className="relative w-full h-full">
                    <div className="anchor">
                      <span>List View</span>
                    </div>
                    <div className="circle1">
                      <div className="half">
                        <div className="inner"></div>
                      </div>
                      <div className="half">
                        <div className="inner"></div>
                      </div>
                    </div>
                    <div className="circle2">
                      <div className="half">
                        <div className="inner"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ctaCircle tracking-wide uppercase text-13 leading-13 font-bold centeredLabel cta-grid text-white pointer-events-auto">
                  <div className="relative w-full h-full">
                    <div className="anchor">
                      <span>Grid View</span>
                    </div>
                    <div className="circle1">
                      <div className="half">
                        <div className="inner"></div>
                      </div>
                      <div className="half">
                        <div className="inner"></div>
                      </div>
                    </div>
                    <div className="circle2">
                      <div className="half">
                        <div className="inner"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ctaCircleRight cta-filters text-orange2 pointer-events-auto">
                  <div className="relative h-full flex flex-col justify-center items-end">
                    <div className="anchor">
                      <span>Filters</span>
                    </div>
                    <div className="circle1">
                      <div className="half">
                        <div className="inner"></div>
                      </div>
                      <div className="half">
                        <div className="inner"></div>
                      </div>
                    </div>
                    <div className="circle2">
                      <div className="half">
                        <div className="inner"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* ////////////////////////////////////////////////////////// */}
            <div
              className="filters absolute w-full left-0 top-full z-10 h-screen"
              data-component="Filters"
            >
              <div className="filters-container bg-white pt-24 lg:pt-0 max-h-4/5 overflow-auto">
                <div className="container sm-only:max-w-xs mx-auto px-4 sm:px-16 py-10 grid gap-x-8 gap-y-10 grid-cols-2 lg:flex lg:justify-start lg:items-start lg:py-28 lg:grid-cols-none">
                  <div className="filter flex-grow" data-filter="office">
                    <div className="text-14 leading-20 font-bold h-10 md:tracking-wide md:text-17 xl:text-32 xl:leading-37 uppercase overflow-hidden">
                      <span>Location</span>
                      <div className="bordered bg-orange2 w-20 h-2px transform -translate-x-full transition-all ease-out-expo duration-1500"></div>
                    </div>
                    <ul className="text-18 leading-18 lg:text-22 lg:leading-22 lg:mt-16">
                      <li
                        className="relative mt-2 cursor-pointer group hover:text-orange2 transition-colors duration-200 ease-linear"
                        data-value="Amsterdam"
                      >
                        <span>Amsterdam</span>
                      </li>
                      <li
                        className="relative mt-2 cursor-pointer group hover:text-orange2 transition-colors duration-200 ease-linear"
                        data-value="Japan"
                      >
                        <span>Japan</span>
                      </li>
                      <li
                        className="relative mt-2 cursor-pointer group hover:text-orange2 transition-colors duration-200 ease-linear"
                        data-value="South Sudan"
                      >
                        <span>South Sudan</span>
                      </li>
                      <li
                        className="relative mt-2 cursor-pointer group hover:text-orange2 transition-colors duration-200 ease-linear"
                        data-value="South Africa"
                      >
                        <span>South Africa</span>
                      </li>
                      <li
                        className="relative mt-2 cursor-pointer group hover:text-orange2 transition-colors duration-200 ease-linear"
                        data-value="Kenya"
                      >
                        <span>Kenya</span>
                      </li>
                      <li
                        className="relative mt-2 cursor-pointer group hover:text-orange2 transition-colors duration-200 ease-linear"
                        data-value="Uganda"
                      >
                        <span>Uganda</span>
                      </li>
                    </ul>
                  </div>
                  <div className="filter flex-grow" data-filter="role">
                    <div className="text-14 leading-20 font-bold h-10 md:tracking-wide md:text-17 xl:text-32 xl:leading-37 uppercase overflow-hidden">
                      <span>Role</span>
                      <div className="bordered bg-orange2 w-20 h-2px transform -translate-x-full transition-all ease-out-expo duration-1500"></div>
                    </div>
                    <ul className="text-18 leading-18 lg:text-22 lg:leading-22 lg:mt-16">
                      <li
                        className="relative mt-2 cursor-pointer group hover:text-orange2 transition-colors duration-200 ease-linear"
                        data-value="Operating Partner"
                      >
                        <span>Operating Partner</span>
                      </li>
                      <li
                        className="relative mt-2 cursor-pointer group hover:text-orange2 transition-colors duration-200 ease-linear"
                        data-value="Partner"
                      >
                        <span>Partner</span>
                      </li>
                      <li
                        className="relative mt-2 cursor-pointer group hover:text-orange2 transition-colors duration-200 ease-linear"
                        data-value="Advisor"
                      >
                        <span>Advisor</span>
                      </li>
                      <li
                        className="relative mt-2 cursor-pointer group hover:text-orange2 transition-colors duration-200 ease-linear"
                        data-value="Operating Partner Analytics"
                      >
                        <span>Operating Partner Analytics</span>
                      </li>
                      <li
                        className="relative mt-2 cursor-pointer group hover:text-orange2 transition-colors duration-200 ease-linear"
                        data-value="Tech Analyst"
                      >
                        <span>Tech Analyst</span>
                      </li>
                      <li
                        className="relative mt-2 cursor-pointer group hover:text-orange2 transition-colors duration-200 ease-linear"
                        data-value="Team Coordinator"
                      >
                        <span>Team Coordinator</span>
                      </li>
                      <li
                        className="relative mt-2 cursor-pointer group hover:text-orange2 transition-colors duration-200 ease-linear"
                        data-value="Venture Analyst"
                      >
                        <span>Venture Analyst</span>
                      </li>
                      <li
                        className="relative mt-2 cursor-pointer group hover:text-orange2 transition-colors duration-200 ease-linear"
                        data-value="Operating Partner, Business &amp; Corporate Development"
                      >
                        <span>
                          Operating Partner, Business & Corporate Development
                        </span>
                      </li>
                      <li
                        className="relative mt-2 cursor-pointer group hover:text-orange2 transition-colors duration-200 ease-linear"
                        data-value="Operations Lead"
                      >
                        <span>Operations Lead</span>
                      </li>
                      <li
                        className="relative mt-2 cursor-pointer group hover:text-orange2 transition-colors duration-200 ease-linear"
                        data-value="Analytics Lead"
                      >
                        <span>Analytics Lead</span>
                      </li>
                      <li
                        className="relative mt-2 cursor-pointer group hover:text-orange2 transition-colors duration-200 ease-linear"
                        data-value="Director"
                      >
                        <span>Director</span>
                      </li>
                      <li
                        className="relative mt-2 cursor-pointer group hover:text-orange2 transition-colors duration-200 ease-linear"
                        data-value="Data Scientist"
                      >
                        <span>Data Scientist</span>
                      </li>
                      <li
                        className="relative mt-2 cursor-pointer group hover:text-orange2 transition-colors duration-200 ease-linear"
                        data-value="Venture Lead"
                      >
                        <span>Venture Lead</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex-shrink-0 absolute left-1/2 top-4 lg:relative lg:left-0 lg:top-0 lg:text-center">
                    <div className="ctaCircleRight cta-filters-close centeredLabel transform -translate-x-1/2 lg:transform-none">
                      <div className="relative h-full flex flex-col justify-center items-end">
                        <div className="anchor">
                          <span>Close</span>
                        </div>
                        <div className="circle1">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                        <div className="circle2">
                          <div className="half">
                            <div className="inner"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="cta-filters-uncheck hidden lg:block text-10 leading-10 uppercase text-orange font-bold hover:underline cursor-pointer mt-10">
                      Uncheck All
                    </div>
                  </div>
                  <div className="cta-filters-uncheck block lg:hidden text-10 leading-10 uppercase text-orange font-bold hover:underline cursor-pointer absolute top-16 -mt-1 right-10">
                    Uncheck All
                  </div>
                </div>
              </div>
            </div>
            <div className="overlay absolute inset-0 bg-dark bg-opacity-80 flex flex-col justify-center invisible">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 container sm-only:max-w-xs px-4 sm:px-16">
                <div
                  className="w-full"
                  data-component="QCircle"
                  data-color="#491777"
                ></div>
              </div>
              <h1
                className="container sm-only:max-w-xs px-4 sm:px-16 mx-auto font-bold text-55 leading-66 text-white text-center z-10 xl:text-110 xl:leading-136"
                data-component="WrapLines"
              >
                Meet our people
              </h1>
            </div>
          </div>
          {/* ///////////////////////////////////////// */}
        </div>
        <NewpageMenuHeader
        menuBackgroundStyle="none"
        listingsVariant="dropdown"
        solutionsLinkMode="plain"
        loginLabel="Login"
        headerVariant="account"
        logoSrc="/images/mkorange.png"
        contactHref="https://contact.mktimothy.com/"
        portalHref="/investors-login/"
        headerZ="z-50"
      />
      </div>
    </div>
  );
};

export default page;


