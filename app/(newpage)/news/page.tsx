"use client";

import { useNewpageEngine } from "@/lib/hooks/useNewpageEngine";

import NewpageMenuHeader from "@/components/newpage/NewpageMenuHeader";
const page = () => {

  const handleNavigation = (href: string) => {
    window.location.href = href;
  };
  useNewpageEngine();

  return (
    <div>
      <div>
        <div
          id="loader"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "#8bb22e",
            zIndex: 10000,
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
        </div>{" "}
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
        </div>{" "}
        <div id="root">
          <div className="relative news text-dark" data-component="News">
            <div className="relative w-full inline-block overflow-hidden pt-40">
              <div className="absolute inset-x-0 px-4 md:px-0">
                <div className="relative w-full max-w-xs max-h-full lg:w-1/2 lg:max-w-screen-lg mx-auto q-container">
                  <div
                    className="relative w-full"
                    data-component="QCircle"
                    data-nosize="true"
                    data-color="#EDEDED"
                  ></div>
                  <div
                    className="absolute w-1/2 h-full top-1/2 left-1/2"
                    data-component="QTail"
                    data-nosize="true"
                    data-color="#EDEDED"
                  ></div>
                  <div className="absolute inset-0 flex flex-col justify-start lg:mt-0 lg:justify-end lg:bottom-1/2">
                    <h1
                      className="-mt-2 font-bold text-75 leading-75 w-0 lg:-ml-20 lg:text-90 lg:leading-90 xl:text-200 xl:leading-160 xl:-ml-36 text-lightpurple"
                      data-component="WrapLines"
                    >
                      Latest news
                    </h1>
                  </div>
                </div>
              </div>
              <div className="px-4 md:px-0">
                <div className="relative w-full max-w-xs max-h-full lg:w-1/2 lg:max-w-screen-lg mx-auto">
                  <div className="pt-full lg:pt-3/4"></div>
                </div>
              </div>

              <div
                className="flex container sm-only:max-w-xs px-4 mx-auto sm:px-16 justify-between items-baseline pb-24 lg:items-start"
                data-scroll-to="next"
              >
                <div className="group flex flex-row-reverse items-end cursor-pointer">
                  <span className="inline-block transform transition-transform ease-in-out duration-500 group-hover:-translate-x-2 text-16 leading-21 lg:text-20 lg:leading-20 -mb-1 w-0 lg:w-auto">
                    Scroll to discover
                  </span>
                  <div className="w-2px mr-4 flex flex-col h-14 overflow-hidden">
                    <div className="transform transition-transform ease-in-out duration-500 w-full h-12 bg-orange mb-1 -mt-10 group-hover:translate-y-10"></div>
                    <div className="transform transition-transform ease-in-out duration-500 w-full h-12 bg-orange group-hover:translate-y-10"></div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="container sm-only:max-w-xs px-4 mx-auto sm:px-16"
              data-scroll-id="next"
            >
              <div className="articles grid gap-12 md:grid-cols-2 lg:grid-cols-3">
                {/* <!-- /////////////////////////////////////////////////////////////////////////////////////////   --> */}
                <div
                  className="article relative "
                  data-year="2022"
                  data-category=""
                  data-type="medium"
                  data-follow-link
                  data-follow-link-target="_self"
                >
                  <div className="relative overflow-hidden">
                    <div className="relative top-0 left-0 h-full w-full overflow-hidden img-content">
                      <img
                        src="https://www.monitor.co.ug/resource/image/1841440/landscape_ratio2x1/960/480/66bd84b13ba5a49d3a7f9715b4d05fe/YU/reviews02pix.jpg"
                        draggable="false"
                        className="w-full no-preload"
                        style={{
                          height: "252px",
                          objectFit: "cover",
                          width: "518px",
                        }}
                        height="752"
                        width="518"
                      />
                    </div>
                    <div className="absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right img-text">
                      Read more
                    </div>
                  </div>

                  <div
                    className="block mt-4 text-16 leading-13"
                    data-date="2022-04-11T20:43:00.000Z"
                    data-animation="reveal"
                  >
                    {" "}
                    January 04, 2021
                  </div>
                  <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                    <i className="text-black text-22 icon-medium"></i>
                  </div>
                  <a
                    href="https://www.monitor.co.ug/uganda/lifestyle/reviews-profiles/musasizi-defied-age-to-thrive-in-ict-world-1841438"
                    className="block mt-4 text-22 leading-32"
                    data-animation="reveal"
                  >
                    Mk Timothy, defied to thrive in ICT world
                  </a>
                </div>
                {/* <!-- ///////////////////////////////////////////////////////////////////////////////////////// --> */}
                <div
                  className="article relative "
                  data-year="2022"
                  data-category=""
                  data-type="medium"
                  data-follow-link
                  data-follow-link-target="_self"
                >
                  <div className="relative overflow-hidden">
                    <div className="relative top-0 left-0 h-full w-full overflow-hidden img-content">
                      <img
                        src="https://newvision-media.s3.amazonaws.com/cms/26625e97-bb26-47be-9baa-0a75b8f86110.jpg"
                        draggable="false"
                        className="w-full no-preload"
                        style={{
                          height: "252px",
                          objectFit: "cover",
                          width: "518px",
                        }}
                        height="752"
                        width="518"
                      />
                    </div>
                    <div className="absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right img-text">
                      Read on medium
                    </div>
                  </div>

                  <div
                    className="block mt-4 text-16 leading-13"
                    data-date="2022-04-06T20:42:00.000Z"
                    data-animation="reveal"
                  >
                    Aug 13, 2022
                  </div>
                  <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                    <i className="text-black text-22 icon-medium"></i>
                  </div>
                  <a
                    href="https://www.newvision.co.ug/category/world/karubanga-a-budding-entrepreneur-ict-guru-140666"
                    className="block mt-4 text-22 leading-32"
                    data-animation="reveal"
                  >
                    Mk, Timothy & Company: A budding entrepreneur, ICT guru
                  </a>
                </div>
                {/* <!-- ///////////////////////////////////////////////////////////////////////////////////////// --> */}
                <div
                  className="article relative "
                  data-year="2022"
                  data-category=""
                  data-type="medium"
                  data-follow-link
                  data-follow-link-target="_self"
                >
                  <div className="relative overflow-hidden">
                    <div className="relative top-0 left-0 h-full w-full overflow-hidden img-content">
                      <img
                        src="https://www.ntv.co.ug/resource/blob/3904528/2232f25a07a9807fe7cd2e803321f6ec/mk-timothy-data.jpg"
                        draggable="false"
                        className="w-full no-preload"
                        style={{
                          height: "252px",
                          objectFit: "cover",
                          width: "518px",
                        }}
                        height={752}
                        width={518}
                      />
                    </div>
                    <div className="absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right img-text">
                      Read on medium
                    </div>
                  </div>

                  <div
                    className="block mt-4 text-16 leading-13"
                    data-date="2022-03-17T22:10:00.000Z"
                    data-animation="reveal"
                  >
                    Aug 5, 2022
                  </div>
                  <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                    <i className="text-black text-22 icon-medium"></i>
                  </div>
                  <a
                    href="https://www.ntv.co.ug/ug/news/musasizi-empowers-others-to-innovate-succeed-in-it-3904530"
                    className="block mt-4 text-22 leading-32"
                    data-animation="reveal"
                  >
                    Mk, Timothy & co empowers others to innovate, succeed in IT
                  </a>
                </div>
                {/* <!-- ///////////////////////////////////////////////////////////////////////////////////////// --> */}
                <div
                  className="article relative "
                  data-year="2022"
                  data-category=""
                  data-type="medium"
                  data-follow-link
                  data-follow-link-target="_self"
                >
                  <div className="relative overflow-hidden">
                    <div className="relative top-0 left-0 h-full w-full overflow-hidden img-content">
                      <img
                        src="https://www.independent.co.ug/wp-content/uploads/2022/08/Timothy-Musasizi.jpg"
                        draggable="false"
                        className="w-full no-preload"
                        style={{
                          height: "252px",
                          objectFit: "cover",
                          width: "518px",
                        }}
                        height="752"
                        width="518"
                      />
                    </div>
                    <div className="absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right img-text">
                      Read on medium
                    </div>
                  </div>

                  <div
                    className="block mt-4 text-16 leading-13"
                    data-date="2022-03-17T14:38:00.000Z"
                    data-animation="reveal"
                  >
                    {" "}
                    August 4, 2022
                  </div>
                  <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                    <i className="text-black text-22 icon-medium"></i>
                  </div>
                  <a
                    href="https://www.independent.co.ug/western-uganda-youth-advised-on-running-profitable-enterprises/"
                    className="block mt-4 text-22 leading-32"
                    data-animation="reveal"
                  >
                    Western Uganda youth advised on running profitable
                    enterprise
                  </a>
                </div>
                {/* <!-- ///////////////////////////////////////////////////////////////////////////////////////// --> */}
                <div
                  className="article relative "
                  data-year="2022"
                  data-category=""
                  data-type="medium"
                  data-follow-link
                  data-follow-link-target="_self"
                >
                  <div className="relative overflow-hidden">
                    <div className="relative top-0 left-0 h-full w-full overflow-hidden img-content">
                      <img
                        src="https://trumpetnews.co.ug/wp-content/uploads/2017/11/IMG-20171119-WA0128-300x200.jpg"
                        draggable="false"
                        className="w-full no-preload"
                        style={{
                          height: "252px",
                          objectFit: "cover",
                          width: "518px",
                        }}
                        height="752"
                        width="518"
                      />
                    </div>
                    <div className="absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right img-text">
                      Read on medium
                    </div>
                  </div>

                  <div
                    className="block mt-4 text-16 leading-13"
                    data-date="2022-03-13T22:12:00.000Z"
                    data-animation="reveal"
                  >
                    {" "}
                    Nov 20, 2017
                  </div>
                  <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                    <i className="text-black text-22 icon-medium"></i>
                  </div>
                  <a
                    href="https://trumpetnews.co.ug/tag/musasizi-timothy-karubanga/"
                    className="block mt-4 text-22 leading-32"
                    data-animation="reveal"
                  >
                    Mk, Timothy & Co together with Tim Tech consults lands $12M
                    mega Congo deal
                  </a>
                </div>
                {/* <!-- //////////////////////////////////////////////////// --> */}
                <div
                  className="article relative "
                  data-year="2022"
                  data-category=""
                  data-type="medium"
                  data-follow-link
                  data-follow-link-target="_self"
                >
                  <div className="relative overflow-hidden">
                    <div className="relative top-0 left-0 h-full w-full overflow-hidden img-content">
                      <img
                        src="https://www.harvestmoney.co.ug/wp-content/uploads/2022/08/6-KAWACOM-U-LTD-speciality-coffee-drying-16-3-1170x780.jpg"
                        draggable="false"
                        className="w-full no-preload"
                        style={{
                          height: "252px",
                          objectFit: "cover",
                          width: "518px",
                        }}
                        height="752"
                        width="518"
                      />
                    </div>
                    <div className="absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right img-text">
                      Read on medium
                    </div>
                  </div>

                  <div
                    className="block mt-4 text-16 leading-13"
                    data-date="2022-02-15T10:45:00.000Z"
                    data-animation="reveal"
                  >
                    Aug 10, 2022
                  </div>
                  <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                    <i className="text-black text-22 icon-medium"></i>
                  </div>
                  <a
                    href="https://www.harvestmoney.co.ug/coffee-dealers-told-to-use-technology-for-international-market/"
                    className="block mt-4 text-22 leading-32"
                    data-animation="reveal"
                  >
                    Coffee Dealers Told To Use Technology For International
                    Market
                  </a>
                </div>
                {/* <!-- //////////////////////////////////////////////////// --> */}
                <div
                  className="article relative hidden"
                  data-year="2022"
                  data-category=""
                  data-type="medium"
                  data-follow-link
                  data-follow-link-target="_self"
                >
                  <div className="relative overflow-hidden">
                    <div className="relative top-0 left-0 h-full w-full overflow-hidden img-content">
                      <img
                        src="https://s3-us-west-2.amazonaws.com/issuewireassets/primg/8980/thumb_timtech-consults-plans-to-take-application-security-management-services-asms-to-the-global-market1.jpg"
                        draggable="false"
                        className="w-full no-preload"
                        style={{
                          height: "252px",
                          objectFit: "cover",
                          width: "518px",
                        }}
                        height="752"
                        width="518"
                      />
                    </div>
                    <div className="absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right img-text">
                      Read on medium
                    </div>
                  </div>

                  <div
                    className="block mt-4 text-16 leading-13"
                    data-date="2022-02-04T10:39:00.000Z"
                    data-animation="reveal"
                  >
                    {" "}
                    Feb 21, 2019
                  </div>
                  <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                    <i className="text-black text-22 icon-medium"></i>
                  </div>
                  <a
                    href="https://www.issuewire.com/timtech-consults-plans-to-take-application-security-management-services-asms-to-the-global-market-1626063531478627"
                    className="block mt-4 text-22 leading-32"
                    data-animation="reveal"
                  >
                    Mk, Timothy & Co Plans to take Application Security
                    Management Services (ASMS) to the Global Market
                  </a>
                </div>
                {/* <!-- //////////////////////////////////////////////////// --> */}
                <div
                  className="article relative hidden"
                  data-year="2022"
                  data-category=""
                  data-type="medium"
                  data-follow-link
                  data-follow-link-target="_self"
                >
                  <div className="relative overflow-hidden">
                    <div className="relative top-0 left-0 h-full w-full overflow-hidden img-content">
                      <img
                        src="https://ia801002.us.archive.org/BookReader/BookReaderImages.php?zip=/34/items/timtechconsults/Role%20of%20technology%20in%20SMART%20governance_jp2.zip&file=Role%20of%20technology%20in%20SMART%20governance_jp2/Role%20of%20technology%20in%20SMART%20governance_0000.jp2&id=timtechconsults&scale=8&rotate=0"
                        draggable="false"
                        className="w-full no-preload"
                        style={{
                          height: "252px",
                          objectFit: "cover",
                          width: "518px",
                        }}
                        height="752"
                        width="518"
                      />
                    </div>
                    <div className="absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right img-text">
                      Read on medium
                    </div>
                  </div>

                  <div
                    className="block mt-4 text-16 leading-13"
                    data-date="2022-02-04T10:37:00.000Z"
                    data-animation="reveal"
                  >
                    {" "}
                    Sep 28, 2019
                  </div>
                  <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                    <i className="text-black text-22 icon-medium"></i>
                  </div>
                  <a
                    href="https://archive.org/details/timtechconsults"
                    className="block mt-4 text-22 leading-32"
                    data-animation="reveal"
                  >
                    Role Of Technology In SMART Governance
                  </a>
                </div>
                {/* <!-- //////////////////////////////////////////////////// --> */}
                <div
                  className="article relative hidden"
                  data-year="2022"
                  data-category=""
                  data-type="medium"
                  data-follow-link
                  data-follow-link-target="_self"
                >
                  <div className="relative overflow-hidden">
                    <div className="relative top-0 left-0 h-full w-full overflow-hidden img-content">
                      <img
                        src="https://www.webthoughtspot.org/wp-content/uploads/2019/02/MG_2042-1024x683.jpg"
                        draggable="false"
                        className="w-full no-preload"
                        style={{
                          height: "252px",
                          objectFit: "cover",
                          width: "518px",
                        }}
                        height="752"
                        width="518"
                      />
                    </div>
                    <div className="absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right img-text">
                      Read on medium
                    </div>
                  </div>

                  <div
                    className="block mt-4 text-16 leading-13"
                    data-date="2022-02-03T10:36:00.000Z"
                    data-animation="reveal"
                  >
                    {" "}
                    Feb 23, 2019
                  </div>
                  <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                    <i className="text-black text-22 icon-medium"></i>
                  </div>
                  <a
                    href="https://www.webthoughtspot.org/business/technology/tim-tech-consults-uganda-introduces-smart-house-construction-technology-to-africa/"
                    className="block mt-4 text-22 leading-32"
                    data-animation="reveal"
                  >
                    Mk, Timothy & Partners Uganda Introduces Smart House
                    Construction Technology to Africa
                  </a>
                </div>
                {/* <!-- //////////////////////////////////////////////////// --> */}
                <div
                  className="article relative hidden"
                  data-year="2022"
                  data-category=""
                  data-type="medium"
                  data-follow-link
                  data-follow-link-target="_self"
                >
                  <div className="relative overflow-hidden">
                    <div className="relative top-0 left-0 h-full w-full overflow-hidden img-content">
                      <img
                        src="https://azadnewsme.com/wp-content/uploads/2019/02/Screen-Shot-2019-02-19-at-11.01.46-AM-696x520.png"
                        draggable="false"
                        className="w-full no-preload"
                        style={{
                          height: "252px",
                          objectFit: "cover",
                          width: "518px",
                        }}
                        height="752"
                        width="518"
                      />
                    </div>
                    <div className="absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right img-text">
                      Read on medium
                    </div>
                  </div>

                  <div
                    className="block mt-4 text-16 leading-13"
                    data-date="2022-02-03T10:36:00.000Z"
                    data-animation="reveal"
                  >
                    {" "}
                    Feb 19, 2019
                  </div>
                  <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                    <i className="text-black text-22 icon-medium"></i>
                  </div>
                  <a
                    href="https://azadnewsme.com/important-factors-consider-outsourcing-support/"
                    className="block mt-4 text-22 leading-32"
                    data-animation="reveal"
                  >
                    Important factors to consider when Outsourcing IT Support
                  </a>
                </div>
                {/* <!-- //////////////////////////////////////////////////// --> */}
                <div
                  className="article relative hidden"
                  data-year="2022"
                  data-category=""
                  data-type="medium"
                  data-follow-link
                  data-follow-link-target="_self"
                >
                  <div className="relative overflow-hidden">
                    <div className="relative top-0 left-0 h-full w-full overflow-hidden img-content">
                      <img
                        src="https://i0.wp.com/pmldaily.com/wp-content/uploads/2020/05/IMG-20200505-WA0017-750x498-1.jpg?resize=750%2C498&ssl=1"
                        draggable="false"
                        className="w-full no-preload"
                        style={{
                          height: "252px",
                          objectFit: "cover",
                          width: "518px",
                        }}
                        height="752"
                        width="518"
                      />
                    </div>
                    <div className="absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right img-text">
                      Read on medium
                    </div>
                  </div>

                  <div
                    className="block mt-4 text-16 leading-13"
                    data-date="2022-02-03T10:36:00.000Z"
                    data-animation="reveal"
                  >
                    May 9, 2020
                  </div>
                  <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                    <i className="text-black text-22 icon-medium"></i>
                  </div>
                  <a
                    href="https://www.pmldaily.com/news/2020/05/covid-19-crisis-over-300-private-sector-players-donate-to-covid-19-taskforce.html"
                    className="block mt-4 text-22 leading-32"
                    data-animation="reveal"
                  >
                    Over 300 private sector players donate to COVID-19 Taskforce
                  </a>
                </div>
                {/* <!-- //////////////////////////////////////////////////// --> */}
                <div
                  className="article relative hidden"
                  data-year="2022"
                  data-category=""
                  data-type="medium"
                  data-follow-link
                  data-follow-link-target="_self"
                >
                  <div className="relative overflow-hidden">
                    <div className="relative top-0 left-0 h-full w-full overflow-hidden img-content">
                      <img
                        src="https://www.kfm.co.ug/wp-content/uploads/2022/08/85D42129-CD30-410F-96C7-F95FA0C9AC0E-750x375.gif"
                        draggable="false"
                        className="w-full no-preload"
                        style={{
                          height: "252px",
                          objectFit: "cover",
                          width: "518px",
                        }}
                        height="752"
                        width="518"
                      />
                    </div>
                    <div className="absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right img-text">
                      Read on medium
                    </div>
                  </div>

                  <div
                    className="block mt-4 text-16 leading-13"
                    data-date="2022-02-03T10:36:00.000Z"
                    data-animation="reveal"
                  >
                    Aug 3, 2022
                  </div>
                  <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                    <i className="text-black text-22 icon-medium"></i>
                  </div>
                  <a
                    href="https://www.kfm.co.ug/news/young-entrepreneur-tips-bushenyi-youth-on-business-success.html"
                    className="block mt-4 text-22 leading-32"
                    data-animation="reveal"
                  >
                    Young entrepreneur tips Bushenyi youth on business success
                  </a>
                </div>
                {/* <!-- //////////////////////////////////////////////////// --> */}
                <div
                  className="article relative hidden"
                  data-year="2022"
                  data-category=""
                  data-type="medium"
                  data-follow-link
                  data-follow-link-target="_self"
                >
                  <div className="relative overflow-hidden">
                    <div className="relative top-0 left-0 h-full w-full overflow-hidden img-content">
                      <img
                        src="https://www.monitor.co.ug/resource/image/3904536/landscape_ratio2x1/960/480/17ada2665c2eb022d100619cd85cfc11/jo/finance02pix.jpg"
                        draggable="false"
                        className="w-full no-preload"
                        style={{
                          height: "252px",
                          objectFit: "cover",
                          width: "518px",
                        }}
                        height="752"
                        width="518"
                      />
                    </div>
                    <div className="absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right img-text">
                      Read on medium
                    </div>
                  </div>

                  <div
                    className="block mt-4 text-16 leading-13"
                    data-date="2022-02-03T10:36:00.000Z"
                    data-animation="reveal"
                  >
                    Aug 05, 2022
                  </div>
                  <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                    <i className="text-black text-22 icon-medium"></i>
                  </div>
                  <a
                    href="https://www.monitor.co.ug/uganda/business/finance/entrepreneur-tips-bushenyi-youth-on-business-success-3904504"
                    className="block mt-4 text-22 leading-32"
                    data-animation="reveal"
                  >
                    Entrepreneur tips Bushenyi youth on business success
                  </a>
                </div>
                {/* <!-- //////////////////////////////////////////////////// --> */}
                <div
                  className="article relative hidden"
                  data-year="2022"
                  data-category=""
                  data-type="medium"
                  data-follow-link
                  data-follow-link-target="_self"
                >
                  <div className="relative overflow-hidden">
                    <div className="relative top-0 left-0 h-full w-full overflow-hidden img-content">
                      <img
                        src="https://saltmedia.ug/images/MID2022/musasizi1.jpg"
                        draggable="false"
                        className="w-full no-preload"
                        style={{
                          height: "252px",
                          objectFit: "cover",
                          width: "518px",
                        }}
                        height="752"
                        width="518"
                      />
                    </div>
                    <div className="absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right img-text">
                      Read on medium
                    </div>
                  </div>

                  <div
                    className="block mt-4 text-16 leading-13"
                    data-date="2022-02-03T10:36:00.000Z"
                    data-animation="reveal"
                  >
                    Aug 6, 2021
                  </div>
                  <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                    <i className="text-black text-22 icon-medium"></i>
                  </div>
                  <a
                    href="https://saltmedia.ug/en/tech/3073-musasizi-empowers-others-innovate,-succeed.html"
                    className="block mt-4 text-22 leading-32"
                    data-animation="reveal"
                  >
                    Ugandan empowered to innovate and succeed in tech
                  </a>
                </div>
                {/* <!-- ///////////////////////////////////////// --> */}
                <div
                  className="article relative hidden"
                  data-year="2022"
                  data-category=""
                  data-type="medium"
                  data-follow-link
                  data-follow-link-target="_self"
                >
                  <div className="relative overflow-hidden">
                    <div className="relative top-0 left-0 h-full w-full overflow-hidden img-content">
                      <img
                        src="https://lh3.googleusercontent.com/QJM7PgKowi4uwebfVWix-KB_HOwdIWG5IgbdEqzUuSf7mC6KyRRNxgg6Ta5zjYD6D-PsfFywboq0sJOUDaJ7kSToOuLky-nmlW2hSyglLuYP=s750"
                        draggable="false"
                        className="w-full no-preload"
                        style={{
                          height: "252px",
                          objectFit: "cover",
                          width: "518px",
                        }}
                        height="752"
                        width="518"
                      />
                    </div>
                    <div className="absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right img-text">
                      Read on medium
                    </div>
                  </div>

                  <div
                    className="block mt-4 text-16 leading-13"
                    data-date="2022-02-03T10:36:00.000Z"
                    data-animation="reveal"
                  >
                    Aug 8, 2022{" "}
                  </div>
                  <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                    <i className="text-black text-22 icon-medium"></i>
                  </div>
                  <a
                    href="https://capitalradio.co.ug/news/2022-08-08-innovation-is-the-way-to-go/"
                    className="block mt-4 text-22 leading-32"
                    data-animation="reveal"
                  >
                    Innovation is the way to go.
                  </a>
                </div>
                {/* <!-- /////////////////////////////////////////////////////// --> */}
                <div
                  className="article relative hidden"
                  data-year="2022"
                  data-category=""
                  data-type="medium"
                  data-follow-link
                  data-follow-link-target="_self"
                >
                  <div className="relative overflow-hidden">
                    <div className="relative top-0 left-0 h-full w-full overflow-hidden img-content">
                      <img
                        src="https://observer.ug/images2/agriculture/Timothy-Karubanga-in-his-coffee-farm.jpg"
                        draggable="false"
                        className="w-full no-preload"
                        style={{
                          height: "252px",
                          objectFit: "cover",
                          width: "518px",
                        }}
                        height="752"
                        width="518"
                      />
                    </div>
                    <div className="absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right img-text">
                      Read on medium
                    </div>
                  </div>

                  <div
                    className="block mt-4 text-16 leading-13"
                    data-date="2022-02-03T10:36:00.000Z"
                    data-animation="reveal"
                  >
                    June 9, 2020
                  </div>
                  <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                    <i className="text-black text-22 icon-medium"></i>
                  </div>
                  <a
                    href="https://observer.ug/businessnews/74679-budding-entrepreneur-urges-coffee-industry-to-adapt-to-new-technologies"
                    className="block mt-4 text-22 leading-32"
                    data-animation="reveal"
                  >
                    Budding entrepreneur urges coffee industry to adapt to new
                    technologies
                  </a>
                </div>
                {/* <!-- ///////////////////////////////////////////////////////////////////////// -->   */}
                <div
                  className="article relative hidden"
                  data-year="2022"
                  data-category=""
                  data-type="medium"
                  data-follow-link
                  data-follow-link-target="_self"
                >
                  <div className="relative overflow-hidden">
                    <div className="relative top-0 left-0 h-full w-full overflow-hidden img-content">
                      <img
                        src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhkDo1bfhKJW-17NE198qFu7vWuyFoGsbwt_e5exo97J4BZ_0O2kXApsSO3pk2dfPOTlnIrUiEg_VW4Y9YlxwQlocYFYkOzoYIPDQkCW8P21q9awoLhOZ9Mk0_vsz9ROD8SgKZ2NroO94-gkTHQMpAozn4HeIb065PZZheWha58bSImR12Y0fUIrJ9L/w400-h200/musasizi.jpg"
                        draggable="false"
                        className="w-full no-preload"
                        style={{
                          height: "252px",
                          objectFit: "cover",
                          width: "518px",
                        }}
                        height="752"
                        width="518"
                      />
                    </div>
                    <div className="absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right img-text">
                      Read on medium
                    </div>
                  </div>

                  <div
                    className="block mt-4 text-16 leading-13"
                    data-date="2022-02-03T10:36:00.000Z"
                    data-animation="reveal"
                  >
                    Aug 17, 2022
                  </div>
                  <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                    <i className="text-black text-22 icon-medium"></i>
                  </div>
                  <a
                    href="https://environmentnewsug.blogspot.com/2022/08/meet-ugaandan-it-innovator-who-is-using.html"
                    className="block mt-4 text-22 leading-32"
                    data-animation="reveal"
                  >
                    Meet Ugandan IT Innovator who is using IT to change lives of
                    the youth.
                  </a>
                </div>
                {/* <!-- /////////////////////////////////////////////////////// --> */}
                <div
                  className="article relative hidden"
                  data-year="2022"
                  data-category=""
                  data-type="medium"
                  data-follow-link
                  data-follow-link-target="_self"
                >
                  <div className="relative overflow-hidden">
                    <div className="relative top-0 left-0 h-full w-full overflow-hidden img-content">
                      <img
                        src="https://cbsfm.ug/wp-content/uploads/2022/08/IMG-20220804-WA0036-750x375.jpg"
                        draggable="false"
                        className="w-full no-preload"
                        style={{
                          height: "252px",
                          objectFit: "cover",
                          width: "518px",
                        }}
                        height="752"
                        width="518"
                      />
                    </div>
                    <div className="absolute bottom-35 right-35 text-white text-13 leading-11 uppercase tracking-wider text-right img-text">
                      Read on medium
                    </div>
                  </div>

                  <div
                    className="block mt-4 text-16 leading-13"
                    data-date="2022-02-03T10:36:00.000Z"
                    data-animation="reveal"
                  >
                    {" "}
                    Aug 10, 2022
                  </div>
                  <div className="absolute top-0 right-0 mr-6 mt-6 w-10 h-10 bg-white flex justify-center items-center round">
                    <i className="text-black text-22 icon-medium"></i>
                  </div>
                  <a
                    href="https://cbsfm.ug/information-tech-consultant-advises-youth-to-engage-in-agribusiness/"
                    className="block mt-4 text-22 leading-32"
                    data-animation="reveal"
                  >
                    Information tech consultant advises youth to engage in
                    agribusiness
                  </a>
                </div>
                {/* <!-- /////////////////////////////////////////////////// -->      */}
              </div>

              <div className="flex justify-end mb-10">
                <div
                  className="ctaCircleRight  text-dark load-more"
                  data-follow-link
                >
                  <div className="relative h-full flex flex-col justify-center items-end">
                    <div className="anchor">
                      <span>See More </span>
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
            <footer data-component="Footer">
              <ul className="container sm-only:max-w-xs mx-auto px-4 sm:px-16 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 text-15 leading-15 mt-32 lg:mt-48 office-container">
                <li className="opacity-0">
                  <span>Uganda</span>
                  <br />
                  <span className="font-light">Home and Office complex)</span>
                </li>
                <li className="opacity-0">
                  <span>Kenya</span>
                  <br />
                  <span className="font-light">20100 Nakuru, Section 58</span>
                </li>
                <li className="opacity-0">
                  <span>South Sudan</span>
                  <br />
                  <span className="font-light">
                    Hai Malakal, Juba, South Sudan 
                  </span>
                </li>
                <li className="opacity-0">
                  <span>South Africa</span>
                  <br />
                  <span className="font-light">Black River Park, Fir St, </span>
                </li>
                <li className="opacity-0">
                  <span>Japan</span>
                  <br />
                  <span className="font-light">
                    Metropolitan Road 319, Kanjo
                    <br />
                  </span>
                </li>
              </ul>
              <div className="relative container sm-only:max-w-xs mx-auto px-2 sm:px-16 flex justify-between md:justify-start items-center pointer-events-auto mt-64 pb-20 sm:mt-36"></div>
            </footer>{" "}
          </div>
        </div>
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
  );
};

export default page;
