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
          data-slug="solutions"
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
                    Our Solutions
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
                  We support companies, investors, governments, and development
                  agencies, helpings them to understand and navigate their
                  operating environments, gain access and influence, and achieve
                  positive impacts.
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
              data-component="CustomPageTwoColumnsImageTitleText"
              className="relative mb-40 xxl:mb-60"
            >
              <div className="split-line">
                <span></span>
              </div>
              <div className="mt-32 lg:mt-56 relative">
                <div className="grid grid-cols-12 lg:absolute lg:inset-0">
                  <div
                    className="col-start-1 col-span-10 lg:col-start-1 lg:col-span-5"
                    data-animation="reveal"
                  >
                    <picture>
                      <source
                        srcSet="
                            https://cdn.sanity.io/images/agx8u29z/production/5214a9980390422a444df0262927e263df9280c5-5472x3648.jpg?rect=0,365,5472,2918&w=814&h=434&auto=format
                          "
                        media="(max-width: 767px)"
                      />
                      <source
                        srcSet="
                            https://cdn.sanity.io/images/agx8u29z/production/5214a9980390422a444df0262927e263df9280c5-5472x3648.jpg?rect=0,365,5472,2918&w=814&h=434&auto=format
                          "
                        media="(min-width: 768px)"
                      />
                      <img
                        src="../../cdn.sanity.io/images/agx8u29z/production/5214a9980390422a444df0262927e263df9280c5-5472x3648750c.jpg?rect=0,365,5472,2918&amp;w=814&amp;h=434&amp;auto=format"
                        draggable="false"
                        className="w-full"
                      />
                    </picture>
                  </div>
                </div>
                <div className="container mx-auto">
                  <div className="grid grid-cols-12">
                    <div className="sm-only:max-w-xs mx-auto px-4 mt-12 lg:px-0 lg:pr-16 lg:mt-16 col-start-1 col-span-12 lg:col-start-7 lg:col-span-6">
                      <a
                        href="
                    https://geneva.mofa.go.ug/content/investing-uganda"
                      >
                        <h2 className="text-60 leading-60 sm:text-70 sm:leading-70 xl:text-110 xl:leading-101 tracking-tight">
                          Business intelligence
                        </h2>
                      </a>
                      <p className="text-22 leading-38 tracking-tight mt-6 lg:mt-16">
                        We have a deep understanding of numerous African
                        markets, deploying this expertise to support clients to
                        maximise opportunities and navigate risk. Market entry
                        and risk management Tailored intelligence Opportunity
                        and partner identification Reputational integrity
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              data-component="CustomPageTwoColumnsImageTitleText"
              className="relative mb-40 xxl:mb-60"
            >
              <div className="split-line">
                <span></span>
              </div>
              <div className="mt-32 lg:mt-56 relative">
                <div className="grid grid-cols-12 lg:absolute lg:inset-0">
                  <div
                    className="col-start-1 col-span-10 lg:col-start-1 lg:col-span-5"
                    data-animation="reveal"
                  >
                    <picture>
                      <source
                        srcSet="
                            https://cdn.sanity.io/images/agx8u29z/production/f0bb10be2574fe71c5868f5b7123f99cdce54204-4898x3265.jpg?rect=0,326,4898,2611&w=814&h=434&auto=format
                          "
                        media="(max-width: 767px)"
                      />
                      <source
                        srcSet="
                            https://cdn.sanity.io/images/agx8u29z/production/f0bb10be2574fe71c5868f5b7123f99cdce54204-4898x3265.jpg?rect=0,326,4898,2611&w=814&h=434&auto=format
                          "
                        media="(min-width: 768px)"
                      />
                      <img
                        src="../../cdn.sanity.io/images/agx8u29z/production/f0bb10be2574fe71c5868f5b7123f99cdce54204-4898x32655f87.jpg?rect=0,326,4898,2611&amp;w=814&amp;h=434&amp;auto=format"
                        draggable="false"
                        className="w-full"
                      />
                    </picture>
                  </div>
                </div>
                <div className="container mx-auto">
                  <div className="grid grid-cols-12">
                    <div className="sm-only:max-w-xs mx-auto px-4 mt-12 lg:px-0 lg:pr-16 lg:mt-16 col-start-1 col-span-12 lg:col-start-7 lg:col-span-6">
                      <h2 className="text-60 leading-60 sm:text-70 sm:leading-70 xl:text-110 xl:leading-101 tracking-tight">
                        Stakeholder engagement
                      </h2>
                      <div className="wysiwyg">
                        <p className="text-22 leading-38 tracking-tight mt-6 lg:mt-16">
                          We utilise our extensive public and private sector
                          networks across Africa to help clients to identify and
                          engage with relevant stakeholders. Stakeholder mapping
                          Stakeholder engagement planning Advocacy
                        </p>
                        <p className="text-22 leading-38 tracking-tight mt-6 lg:mt-16">
                          We also work directly with global investors to unlock
                          investment opportunities and facilitate expansion. We
                          bring industry, community and government partners
                          together to offer seamless services that make it easy
                          for you to grow your operations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              data-component="CustomPageTwoColumnsImageTitleText"
              className="relative mb-40 xxl:mb-60"
            >
              <div className="split-line">
                <span></span>
              </div>
              <div className="mt-32 lg:mt-56 relative">
                <div className="grid grid-cols-12 lg:absolute lg:inset-0">
                  <div
                    className="col-start-1 col-span-10 lg:col-start-1 lg:col-span-5"
                    data-animation="reveal"
                  >
                    <picture>
                      <source
                        srcSet="
                            https://cdn.sanity.io/images/agx8u29z/production/76622d98ddf4f62eb3e23a57e7106e461708a926-6555x4372.jpg?rect=0,438,6555,3495&w=814&h=434&auto=format
                          "
                        media="(max-width: 767px)"
                      />
                      <source
                        srcSet="
                            https://cdn.sanity.io/images/agx8u29z/production/76622d98ddf4f62eb3e23a57e7106e461708a926-6555x4372.jpg?rect=0,438,6555,3495&w=814&h=434&auto=format
                          "
                        media="(min-width: 768px)"
                      />
                      <img
                        src="../../cdn.sanity.io/images/agx8u29z/production/76622d98ddf4f62eb3e23a57e7106e461708a926-6555x4372e172.jpg?rect=0,438,6555,3495&amp;w=814&amp;h=434&amp;auto=format"
                        draggable="false"
                        className="w-full"
                      />
                    </picture>
                  </div>
                </div>
                <div className="container mx-auto">
                  <div className="grid grid-cols-12">
                    <div className="sm-only:max-w-xs mx-auto px-4 mt-12 lg:px-0 lg:pr-16 lg:mt-16 col-start-1 col-span-12 lg:col-start-7 lg:col-span-6">
                      <h2 className="text-60 leading-60 sm:text-70 sm:leading-70 xl:text-110 xl:leading-101 tracking-tight">
                        Sustainability advisory
                      </h2>
                      <p className="text-22 leading-38 tracking-tight mt-6 lg:mt-16">
                        We employ our strategic advisory experience to drive and
                        protect value creation for our clients in Africa, while
                        ensuring ethical action and integrity throughout supply
                        chains. ESG framework creation and assurance ESG due
                        diligence and auditing Sustainability consulting and
                        non-financial reporting
                      </p>
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
                  Hai Malakal, Juba, South Sudan{" "}
                </span>
              </li>
              <li className="opacity-0">
                <span>South Africa</span>
                <br />
                <span className="font-light">Black River Park, Fir St</span>
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
