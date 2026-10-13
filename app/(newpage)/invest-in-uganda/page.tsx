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
        {/* ////////////////////////////// */}
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
        {/* ///////////////////////////////////////////////// */}
        <div id="root">
          <div
            className="MKTimothy relative text-white bg-purple"
            data-component="MKTimothy"
          >
            <div className="fixed inset-0" data-component="PixiView"></div>
            <div className="relative section-content">
              <div className="relative section">
                <div className="flex items-center min-h-screen">
                  <div className="container sm-only:max-w-xs px-4 mx-auto sm:px-16">
                    <h1
                      className="text-white text-50 leading-50 font-bold max-w-xs lg:text-120 lg:leading-96 lg:max-w-screen-md"
                      data-component="WrapLines"
                    >
                      Why Invest in Uganda?
                    </h1>

                    <div
                      className="group mt-44 flex flex-row-reverse items-end cursor-pointer justify-end scroll-discover"
                      data-scroll-to="next"
                      data-scroll-decay="0"
                    >
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
              </div>

              <div className="relative section" data-scroll-id="next">
                <div className="lg:flex items-center min-h-screen">
                  <div className="container sm-only:max-w-xs px-4 mx-auto sm:px-16">
                    {/* <!-- <h2
                      className="text-33 leading-36 sm:text-66 sm:leading-70 sm:w-2/3 xl:text-90 xl:leading-96 lg:w-1/2 lg:ml-auto lgh:w-2/3 lgh:text-66 lgh:leading-70"
                      data-component="WrapLines"
                      data-visible="false"
                    >
                      Uganda Investment Authority (UIA) and Uganda investment
                      promotion agency
                    </h2> --> */}

                    <div className="lg:flex flex-row items-center mt-12 lg:mt-36">
                      <div className="lg:w-2/3 lg:text-center anim-inside">
                        <div className="text-40 leading-30 lg:text-133 lg:leading-101"></div>
                        <div className="text-15 leading-30 lg:text-19 lg:leading-30"></div>
                      </div>
                      <div className="mt-12 text-22 leading-35 lg:mt-0 lg:w-1/3 anim-inside children:opacity-0">
                        <div className="wysiwyg">
                          <p className="my-6">
                            Uganda operates in a highly secure, free-market
                            Environment, all inclusive (for all men and women),
                            with a youthful population, Abundant resources, fast
                            expanding economy that automatically avails most
                            favorable, multiple investment opportunities unlike
                            any other country around the globe. The Government
                            of Uganda has taken into its strategy for the
                            economic agenda, four main areas of investment that
                            can foster economic growth for Ugandans and ensure
                            middle income status by 2040. These are areas of
                            Agriculture, Infrastructure, Oil, and Technology
                            innovations, all of which should be aligned with the
                            Sustainable development goals.
                          </p>
                          <p className="my-6"></p>
                          <p className="my-6">
                            Below are <strong>Four Key</strong> points on why
                            you should invest in Uganda.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative section">
                <div className="lg:flex items-center min-h-screen">
                  <div className="container sm-only:max-w-xs px-4 mx-auto sm:px-16">
                    <h2
                      className="text-33 leading-36 sm:text-66 sm:leading-70 sm:w-2/3 lg:text-90 lg:leading-96 lg:w-1/2"
                      data-component="WrapLines"
                      data-visible="false"
                    >
                      Favorable Legislation/Policy
                    </h2>
                    <div className="anim-inside mt-12 lg:mt-36">
                      <div className="wysiwyg">
                        <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20">
                          The Public-Private Partnership Act of 2015 was
                          introduced and has shown an appetite for Foreign
                          Direct Investment (FDI) but also Local investment, and
                          this is an opportunity that has not been fully tapped
                          into for economic growth in Uganda.
                        </p>
                        <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20">
                          The World Bank highlights that such strong policies
                          will translate Uganda’s potential into an economic hub
                          for Africa, and you want to be a part of that when it
                          inevitably happens.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative section">
                <div className="lg:flex items-center min-h-screen">
                  <div className="container sm-only:max-w-xs px-4 mx-auto sm:px-16">
                    <h2
                      className="text-33 leading-36 sm:text-66 sm:leading-70 sm:w-2/3 lg:text-90 lg:leading-96 lg:w-1/2 lg:ml-auto"
                      data-component="WrapLines"
                      data-visible="false"
                    >
                      Ready Markets
                    </h2>
                    <div className="anim-inside mt-12 lg:mt-36">
                      <div className="wysiwyg">
                        <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20 lg:ml-auto">
                          Uganda provides avenues for ready good-sized market
                          scopes both domestically and internationally and yet
                          these are not being fully capitalized on.
                        </p>
                        <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20 lg:ml-auto">
                          Regional Integration has been fostered to further this
                          cause. For example, through the most recently signed
                          Africa Continental Free Trade Agreement, Uganda will
                          have benefits of jobs created, poverty reduction,
                          sustainable increase in the GDP, among others. It is a
                          game changer for Uganda’s economy and Africa as a
                          whole.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative section">
                <div className="lg:flex items-center min-h-screen">
                  <div className="container sm-only:max-w-xs px-4 mx-auto sm:px-16">
                    <h2
                      className="text-33 leading-36 sm:text-66 sm:leading-70 sm:w-2/3 lg:text-90 lg:leading-96 lg:w-1/2"
                      data-component="WrapLines"
                      data-visible="false"
                    >
                      Fast growing Economy
                    </h2>
                    <div className="anim-inside mt-12 lg:mt-36">
                      <div className="wysiwyg">
                        <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20">
                          A true definition of an economic success story, Uganda
                          boasts of a GDP that approximately doubled every
                          decade from 1990 to 2010. Like all economies around
                          the world however, the past decade was purged by
                          pandemics and wars in Europe that caused the
                          inevitable decline in GDP recently. Fortunately,
                          Uganda had already set in place an international trend
                          for the private sector growth through stable
                          macroeconomics and a broadly supportive economic
                          environment. This has evidently kept Uganda resilient
                          in the face of economic shocks hence providing an
                          ample space for Investment in all sectors of
                          development.
                        </p>
                        {/* <!-- <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20">
                          Note: Potential Investors together with Ugandans living in
                          abroad are informed that the INVESTMENT GUIDE can be
                          accessed on the Uganda Revenue Authority (URA) website
                          www.ura.go.ug follows: (click A-Z Tax Topics, go to T and
                          click Tax Incentives Guide 2021).
                        </p>
                        <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20">
                          Bankable Projects 2019 20 APPROVED-1 BRIEF GUIDE
                          -to-doing-business-in-Uganda COMPENDIUM 50 BUSINESS IDEAS
                          EDIBLE OIL BRONCHURE ELECTRONIC BRONCHURE INCENTIVE GUIDE
                          FOR 20 - 21 PHARMA BRONCHURE AGOA-Profile
                          Compendium-of-Investment-and-Business-Opportunities
                          Compendium-of-Investment-and-Business New-SME-Brochure
                          UIA-Investment-license-Checklist UIA-one-stop-guide
                          A-practical-guide-to-doing-business-in-Uganda A guide to
                          Uganda's Coffees ucda
                        </p>
                        <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20">
                          Need more?
                        </p>
                        <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20">
                          <br />
                        </p>
                        <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20">
                          <br />
                        </p> --> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* ///////////////////////////////////// */}
              <div className="relative section">
                <div className="lg:flex items-center min-h-screen">
                  <div className="container sm-only:max-w-xs px-4 mx-auto sm:px-16">
                    <h2
                      className="text-33 leading-36 sm:text-66 sm:leading-70 sm:w-2/3 lg:text-90 lg:leading-96 lg:w-1/2 lg:ml-auto"
                      data-component="WrapLines"
                      data-visible="false"
                    >
                      Investment Incentives
                    </h2>
                    <div className="anim-inside mt-12 lg:mt-36">
                      <div className="wysiwyg">
                        <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20 lg:ml-auto">
                          Uganda has got standard investment incentives for
                          foreign investors who can qualify for incentives under
                          the Integrated Client Account (ICA) where the investor
                          makes a capital investment or an equivalent in capital
                          goods worth at least $500,000 by way of capital
                          invested. The second schedule to the ICA contains
                          priority investment areas for which additional
                          benefits maybe granted, which are as follows:
                        </p>
                        <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20 lg:ml-auto">
                          <strong> i.</strong> Concessional rates of import duty
                          for an investor who is importing any plant, machinery,
                          equipment, vehicles or construction materials for an
                          investment project.
                          <br />
                          <strong> ii.</strong> Exemption from payment of import
                          duty on one motor vehicle for personal use, personal
                          and household effects which the person owned and used
                          outside the East African Partner State for at least
                          twelve months. Such person must show that he is
                          changing residence from a place outside the East
                          African Partner State to a place within the East
                          African Partner State.
                          <br />
                          <strong> iii.</strong> Incentives available generally
                          for start-up businesses under custom laws, the Income
                          Tax Act (Cap 340) (ITA) and the Value-Added Tax Act
                          (Cap 349).
                          <br />
                          <strong> iv.</strong> Drawback of duties payable on
                          imported inputs used in producing goods for export as
                          provided in the laws imposing such duties and taxes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative py-36 flex justify-center">
              <div
                className="ctaCircle tracking-wide uppercase text-13 leading-13 font-bold cta-homepage ctaVisible"
                data-follow-link="/all-listings"
              >
                <div className="relative w-full h-full">
                  <a target="_self" href="/all-listings" className="anchor">
                    <span>INVEST IN UGANDA</span>
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
        </div>
        {/* ///////////////////////////////////////////////// */}
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
