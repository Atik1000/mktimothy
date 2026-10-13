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
            className="relative custom-page text-dark"
            data-component="CustomPage"
            data-slug="about"
          >
            <div className="relative w-full inline-block overflow-hidden pt-40 xl:pb-20">
              <div className="absolute inset-x-0 px-4 md:px-0">
                <div className="relative w-full max-w-xs max-h-full lg:w-1/2 lg:max-w-screen-lg mx-auto">
                  <div
                    className="absolute w-full3 -top-full -left-full"
                    data-component="QLargeCircle"
                  ></div>
                  <div
                    className="relative w-full"
                    data-component="QCircle"
                    data-nosize="true"
                  ></div>
                  <div className="absolute inset-0 flex flex-col justify-start lg:mt-0 lg:justify-end lg:bottom-1/2">
                    <h1
                      className="-mt-2 font-bold text-75 leading-75 w-0 lg:-ml-20 lg:text-90 lg:leading-90 xl:text-200 xl:leading-160 xl:-ml-36"
                      data-component="WrapLines"
                    >
                      Our legacy
                    </h1>
                  </div>
                </div>
              </div>
              <div className="px-4 md:px-0">
                <div className="relative w-full max-w-xs max-h-full lg:w-1/2 lg:max-w-screen-lg mx-auto">
                  <div className="pt-full lg:pt-3/4"></div>
                </div>
              </div>
              <div className="px-4 md:px-0">
                <div className="relative w-full max-w-xs max-h-full md:max-w-md md:px-4 lg:w-1/2 lg:max-w-screen-lg mx-auto">
                  <div
                    className="group mt-10 flex flex-row-reverse items-end cursor-pointer lg:absolute lg:bottom-0 lg:-ml-20 xl:-ml-36"
                    data-scroll-to="content"
                  >
                    <span className="inline-block transform transition-transform ease-in-out duration-500 mr-20 group-hover:-translate-x-2 text-16 leading-21 lg:text-20 lg:leading-20 -mb-1 w-0 lg:w-auto">
                      Scroll to discover
                    </span>
                    <div className="w-2px mr-4 flex flex-col h-14 overflow-hidden">
                      <div className="transform transition-transform ease-in-out duration-500 w-full h-12 bg-orange mb-1 -mt-10 group-hover:translate-y-10"></div>
                      <div className="transform transition-transform ease-in-out duration-500 w-full h-12 bg-orange group-hover:translate-y-10"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 md:px-0">
                <div
                  className="relative w-full max-w-xs max-h-full md:max-w-screen-md md:px-4 lg:w-1/2 lg:max-w-screen-lg mx-auto"
                  data-animation="reveal"
                >
                  <p className="relative text-29 leading-49 mt-10 lg:ml-20 lg:left-1/2 lg:w-1/2 lg:mt-0">
                    Founded in 2016 by Musasizi Timothy Karubanga, a
                    distinguished Ugandan-born Japanese angel investor and
                    venture capitalist, Mk Timothy & Company embarked on a
                    mission to bolster investors and corporations operating both
                    in Uganda and on the global stage. From the get-go, we
                    championed the African continent, painting it as a hub where
                    commercial ventures not only yield profitable returns but
                    also foster meaningful development impacts.
                  </p>
                </div>
                <div className="relative w-full max-w-xs max-h-full md:max-w-screen-md lg:w-1/2 lg:max-w-screen-lg mx-auto">
                  <div className="pt-1/2"></div>
                  <div
                    className="absolute top-0 left-1/2 w-1/2 h-full lg:left-2/3"
                    data-component="QTail"
                  ></div>
                </div>
              </div>
            </div>
            <div data-scroll-id="content">
              <div
                data-component="CustomPageTwoColumnsImageTexts"
                className="relative mt-60 mb-40 pb-40 lg:mt-20 lg:pb-60"
              >
                <div className="picture-wrapper relative w-11/12 -top-40 -mb-40 lg:w-1/4 lg:absolute lg:-top-96 lg:left-0 lg:mb-0">
                  <picture>
                    <source
                      srcSet="
                    https://cdn.sanity.io/images/agx8u29z/production/d0b72e0dd8d1d395a8c485418825ca70d73daf87-3742x5613.jpg?rect=0,72,3742,5467&w=705&h=1030&auto=format
                  "
                      media="(max-width: 767px)"
                    />
                    <source
                      srcSet="
                    https://cdn.sanity.io/images/agx8u29z/production/d0b72e0dd8d1d395a8c485418825ca70d73daf87-3742x5613.jpg?rect=841,0,2059,5613&w=467&h=1273&auto=format
                  "
                      media="(min-width: 768px)"
                    />
                    <img
                      src=" https://cdn.sanity.io/images/agx8u29z/production/d0b72e0dd8d1d395a8c485418825ca70d73daf87-3742x561381a2.jpg"
                      draggable="false"
                      className="w-full"
                    />
                  </picture>
                </div>

                <div className="relative w-full sm-only:max-w-xs max-h-full md:max-w-screen-md md:px-4 lg:w-1/2 lg:max-w-screen-lg mx-auto">
                  <div className="relative lg:ml-20 lg:left-1/2 lg:w-1/2 px-4 sm:px-16 md:px-0">
                    <div className="wysiwyg">
                      <p className="text-22 leading-38 tracking-tight mt-16">
                        As the African business landscape metamorphosed over the
                        years, so did our focus and array of services. From the
                        ancient trade routes to the modern digital highways, our
                        involvement with the continent's sectors has broadened,
                        touching upon vibrant industries that are now the
                        bedrock of modern Africa.
                      </p>
                      <p className="text-22 leading-38 tracking-tight mt-16">
                        It brings us immense pride to be the backbone for
                        several sectors, partnering with some of the most
                        esteemed investors in areas including development
                        finance, renewable energy, telecommunications, and
                        transportation and logistics. But, no matter how vast
                        our reach grows or how diverse our portfolio becomes,
                        the essence of Mk Timothy & Company's modus operandi
                        remains unaltered. Our commitment remains unwavering: to
                        provide unmatched service to our clientele, aiding them
                        in realizing their operational aspirations, and in the
                        process, crafting a legacy of value for both investors
                        and the resplendent African communities.
                      </p>
                      <p className="text-22 leading-38 tracking-tight mt-16">
                        Our beacon is clear: to further sustainable and
                        equitable investment across Africa. And in this journey,
                        we actively beckon foreign entrepreneurs to discover the
                        myriad opportunities that Uganda, our home, holds in
                        store. Welcome to Mk Timothy & Company, where Africa's
                        potential meets global ambition.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div data-component="CustomPageFacts" className="mt-32 mb-28">
                <div className="relative">
                  <div className="absolute inset-0 overflow-hidden">
                    <picture>
                      <source
                        srcSet="
                      https://cdn.sanity.io/images/agx8u29z/production/54a1d4c992a701f1087179a248c7cf49a175665f-3000x3000.jpg?rect=1161,0,679,3000&w=375&h=1658&auto=format
                    "
                        media="(max-width: 767px)"
                      />
                      <source
                        srcSet="
                      https://cdn.sanity.io/images/agx8u29z/production/54a1d4c992a701f1087179a248c7cf49a175665f-3000x3000.jpg?rect=0,382,3000,2234&w=1920&h=1430&auto=format
                    "
                        media="(min-width: 768px)"
                      />
                      <img
                        src=" https://cdn.sanity.io/images/agx8u29z/production/54a1d4c992a701f1087179a248c7cf49a175665f-3000x3000c4c9.jpg"
                        draggable="false"
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      />
                    </picture>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-15"></div>
                  <div className="relative py-52">
                    <div className="container mx-auto px-8 lg:px-24">
                      <div className="split-line border-2 border-white opacity-25"></div>
                      <div className="lg:flex justify-between mt-12 lg:mt-16">
                        <h2 className="lg:w-1/2 text-lightgray text-70 leading-70 lg:text-110 lg:leading-113">
                          WHY INVEST IN UGANDA?
                        </h2>
                        <div className="lg:w-1/2 lg:pr-8 xl:pl-32 mt-8 lg:mt-0">
                          <p className="text-22 leading-38 text-lightgray">
                            Uganda, the Pearl of Africa, is primed for investors
                            with its stable political landscape, strategic
                            location, and growing market. Africa's best-kept
                            secret for investment. With unmatched stability, a
                            robust economy, and a wealth of untapped resources
                            Uganda offers unparalleled growth opportunities.Tap
                            into a young, skilled workforce, lucrative tax
                            incentives, and a gateway to East Africa’s booming
                            markets. Be part of Uganda’s extraordinary rise!.
                          </p>
                          <div
                            className="ctaCircleRight mt-12 text-white whitespace-nowrap"
                            data-animation="reveal-cta"
                          >
                            <div className="relative h-full flex flex-col justify-center items-end">
                              <a
                                href="/all-listings"
                                target="_blank"
                                className="anchor"
                              >
                                <span>Invest in Uganda Now</span>
                              </a>
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
                      <div className="split-line border-2 border-white opacity-25 mt-16 lg:mt-48"></div>
                      <div className="lg:flex justify-between mt-16 lg:mt-32">
                        <div className="names lg:w-1/2">
                          <div className="text-41 leading-60 text-orange2 tracking-tight cursor-pointer xl:text-80 xl:leading-96"></div>
                          <div className="text-41 leading-60 text-orange2 tracking-tight cursor-pointer xl:text-80 xl:leading-96">
                            Mk Timothy & Partners I
                          </div>
                        </div>

                        <div className="texts relative mt-12 lg:w-1/2 lg:mt-0">
                          <div className="absolute w-full top-0 left-0 text-22 leading-38 tracking-tight xl:pl-32">
                            <p className="text-22 leading-38 text-lightgray">
                              Invest in Uganda now – a goldmine of growth,
                              resources unbeatable returns you can’t afford to
                              miss!.
                            </p>
                          </div>
                          <div className="absolute w-full top-0 left-0 text-22 leading-38 tracking-tight xl:pl-32">
                            <div className="wysiwyg">
                              <p className="text-22 leading-38 text-lightgray">
                                Unlock Uganda’s untapped potential – abundant
                                resources, rapid growth, and extraordinary
                                returns are waiting for you!.
                              </p>
                              <p className="text-22 leading-38 text-lightgray">
                                <br />
                              </p>
                              <p className="text-22 leading-38 text-lightgray">
                                <br />
                              </p>
                            </div>
                          </div>
                        </div>
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
                  <span className="font-light">308-8988 Fraserton Court </span>
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
            </footer>
          </div>
        </div>
                <NewpageMenuHeader
        menuBackgroundStyle={"none"}
        listingsVariant={"plain"}
        solutionsLinkMode={"plain"}
        loginLabel={"Login"}
        headerVariant={"account"}
        logoSrc={"/images/mkorange.png"}
        contactHref={"https://contact.mktimothy.com/"}
        portalHref={"/investors-login/"}
        headerZ={"z-50"}
        headerLinksTasveer={true}
        secMenuCursorPointer={false}
      />
      </div>
    </div>
  );
};

export default page;
