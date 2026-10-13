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
                      Invest in the Uganda Stock Market
                    </h1>
                    <p>
                      Start investing in the Uganda stock market by opening a
                      Securities Central Depository (SCD) account with a
                      licensed broker. Fund your brokerage trust account to buy
                      and sell shares on the Uganda Securities Exchange (USE).
                      The market offers growth opportunities in key sectors like
                      banking and telecommunications. Investing in Ugandan
                      stocks provides potential for dividends, capital gains,
                      and voting rights but comes with risks like market
                      volatility. Diversify your portfolio and stay informed to
                      maximize returns. Use licensed brokers and seek
                      professional advice to navigate the Ugandan stock market
                      successfully.
                    </p>
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
                    <h2
                      className="text-33 leading-36 sm:text-66 sm:leading-70 sm:w-2/3 xl:text-90 xl:leading-96 lg:w-1/2 lg:ml-auto lgh:w-2/3 lgh:text-66 lgh:leading-70"
                      data-component="WrapLines"
                      data-visible="false"
                    >
                      How to invest in stock market in Uganda
                    </h2>

                    <div className="lg:flex flex-row items-center mt-12 lg:mt-36">
                      <div className="lg:w-2/3 lg:text-center anim-inside">
                        <div className="text-40 leading-30 lg:text-133 lg:leading-101"></div>
                        <div className="text-15 leading-30 lg:text-19 lg:leading-30"></div>
                      </div>
                      <div className="mt-12 text-22 leading-35 lg:mt-0 lg:w-1/3 anim-inside children:opacity-0">
                        <div className="wysiwyg">
                          <p className="my-6">
                            Investing in the stock market in Uganda starts with
                            opening a Securities Central Depository (SCD)
                            account through a licensed stockbroker in Uganda.
                            After opening your SCD account, fund your brokerage
                            trust account, then place buy orders for shares
                            listed on the Uganda Securities Exchange (USE). The
                            market offers opportunities across key sectors like
                            banking and telecommunications. Stay informed,
                            diversify your investments, and consider
                            professional advice to grow your wealth safely and
                            effectively.
                          </p>
                          <p className="my-6"></p>
                          <p className="my-6">
                            Below are <strong>Many Key</strong> points on How to
                            invest in stock market in Uganda.
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
                      Opening Your Securities Central Depository (SCD) Account
                      in Uganda
                    </h2>
                    <div className="anim-inside mt-12 lg:mt-36">
                      <div className="wysiwyg">
                        <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20">
                          To begin trading on the Uganda Securities Exchange,
                          you first need to open a Securities Central Depository
                          (SCD) account. The SCD account serves as a digital
                          ledger for your shareholdings, ensuring secure and
                          transparent ownership records. You can open an SCD
                          account free of charge through any licensed stock
                          brokerage firm in Uganda. Requirements typically
                          include a valid national ID and passport-sized photos.
                          This account is essential for participation in the
                          Ugandan stock trading system and enables seamless
                          settlement of share transactions.
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
                      Funding Your Brokerage Trust Account for Ugandan Stock
                      Investment
                    </h2>
                    <div className="anim-inside mt-12 lg:mt-36">
                      <div className="wysiwyg">
                        <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20 lg:ml-auto">
                          After securing your SCD account, you need to fund a
                          trust account maintained by your chosen Ugandan
                          stockbroker. The Uganda Securities Exchange mandates
                          upfront payment for share purchases to protect both
                          investors and market integrity. Depositing funds into
                          your broker's trust account ensures your bids are
                          backed by actual capital, a key part of the stock
                          market trading process in Uganda. This trust account
                          acts as a financial gateway for executing buy orders
                          on your behalf.
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
                      How to Buy Shares on the Uganda Securities Exchange
                    </h2>
                    <div className="anim-inside mt-12 lg:mt-36">
                      <div className="wysiwyg">
                        <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20">
                          With your brokerage account funded, you instruct your
                          broker to place buy orders on the Automated Trading
                          System (ATS) of the USE. During official market hours,
                          your broker enters your bid for shares of listed
                          companies, such as those in the banking,
                          manufacturing, and telecommunications sectors. When a
                          seller's offer matches your bid, a trade is executed
                          automatically, and the shares are credited to your SCD
                          account. Buying shares on the USE opens the door to
                          capital appreciation and dividend income from Uganda's
                          leading businesses.
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
                      Selling Shares on the Ugandan Stock Market and Accessing
                      Proceeds
                    </h2>
                    <div className="anim-inside mt-12 lg:mt-36">
                      <div className="wysiwyg">
                        <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20 lg:ml-auto">
                          Selling shares on the Uganda Securities Exchange
                          follows a similarly straightforward process. Inform
                          your broker of the shares you want to sell, and they
                          will list your sell order on the ATS. Once matched
                          with a buyer's bid, the sale completes, and the shares
                          are deducted from your SCD account. The sale proceeds
                          are then transferred directly to your bank account,
                          offering liquidity and flexibility in managing your
                          Ugandan investment portfolio.
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
                    className="text-33 leading-36 sm:text-66 sm:leading-70 sm:w-2/3 lg:text-90 lg:leading-96 lg:w-1/2 lg:ml-auto"
                    data-component="WrapLines"
                    data-visible="false"
                  >
                    Understanding Order Types: Limit and Market Orders on the
                    Uganda Securities Exchange
                  </h2>
                  <div className="anim-inside mt-12 lg:mt-36">
                    <div className="wysiwyg">
                      <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20 lg:ml-auto">
                        Investors can place different types of orders on the USE
                        to control how their trades are executed. A limit order
                        specifies the exact price you are willing to pay (when
                        buying) or accept (when selling), giving you price
                        control but possibly delaying execution. A market order,
                        on the other hand, prioritizes speed and executes
                        immediately at the best available price. Both order
                        types are vital tools in optimizing your stock trading
                        strategy in Uganda and navigating market volatility.
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
                    Benefits of Investing in Ugandan Stocks
                  </h2>
                  <div className="anim-inside mt-12 lg:mt-36">
                    <div className="wysiwyg">
                      <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20 lg:ml-auto">
                        Investing in the Ugandan stock market offers several
                        benefits. Shareholders gain partial ownership in
                        companies with voting rights at Annual General Meetings,
                        enabling participation in important corporate decisions.
                        Shares provide opportunities for income through
                        dividends and wealth growth through capital gains. The
                        USE market offers liquidity, transparency, and investor
                        protections regulated by the Uganda Capital Markets
                        Authority. Additionally, stocks tend to offer a hedge
                        against inflation and can serve as collateral for
                        securing loans. These features make the Ugandan stock
                        market an attractive choice for both new and experienced
                        investors.
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
                    Risks to Consider When Investing in Ugandan Stocks
                  </h2>
                  <div className="anim-inside mt-12 lg:mt-36">
                    <div className="wysiwyg">
                      <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20 lg:ml-auto">
                        While the Ugandan stock market has growth potential,
                        investors must also consider risks. Share prices can
                        fluctuate due to economic shifts, political events, or
                        sector-specific challenges. Volatility in the East
                        African stock market requires careful research and
                        diversification to mitigate losses. It is advisable to
                        seek professional advice and keep abreast of market
                        updates from USE publications and the Uganda Capital
                        Markets Authority to make informed decisions.
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
                    Support for Investors on the Uganda Securities Exchange
                  </h2>
                  <div className="anim-inside mt-12 lg:mt-36">
                    <div className="wysiwyg">
                      <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20 lg:ml-auto">
                        The USE supports investors through market data, regular
                        performance reports, and regulatory oversight to ensure
                        a fair and efficient trading environment. Many investors
                        benefit from advisory services offered by firms such as
                        Mk Timothy & Company, which provide expert guidance on
                        legal, compliance, and market research aspects. These
                        services can help optimize your investments and navigate
                        the Ugandan capital markets successfully.
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
                    Why Invest in the Ugandan Stock Market Today?
                  </h2>
                  <div className="anim-inside mt-12 lg:mt-36">
                    <div className="wysiwyg">
                      <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20 lg:ml-auto">
                        The Ugandan stock market represents a growing and
                        promising opportunity for wealth creation and economic
                        development. By opening an SCD account, funding your
                        brokerage trust account, and using licensed brokers to
                        trade shares on the USE, you can participate in Uganda's
                        expanding business landscape. With ongoing
                        modernization, strong regulatory frameworks, and diverse
                        investment options, the USE is an attractive market for
                        local and international investors looking to grow their
                        portfolio with Ugandan shares.
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
                    Frequently Asked Questions (FAQ)
                  </h2>
                  <div className="anim-inside mt-12 lg:mt-36">
                    <div className="wysiwyg">
                      <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20 lg:ml-auto">
                        <strong>
                          Q1: How do I start investing in the Ugandan stock
                          market?
                        </strong>
                        <br />
                        To start investing, you need to open a Securities
                        Central Depository (SCD) account through a licensed
                        stockbroker in Uganda. After opening your SCD account,
                        fund your brokerage trust account, then place buy orders
                        for shares listed on the Uganda Securities Exchange
                        (USE).
                      </p>

                      <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20 lg:ml-auto">
                        <strong>
                          Q2: What documents are required to open an SCD
                          account?
                        </strong>
                        <br />
                        Typically, you need a valid national ID or passport and
                        passport-sized photos. Account opening is free and
                        managed by licensed brokerage firms.
                      </p>

                      <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20 lg:ml-auto">
                        <strong>
                          Q3: Can foreigners invest in the Uganda Securities
                          Exchange?
                        </strong>
                        <br />
                        Yes, the USE welcomes both local and foreign investors.
                        Foreign investors can participate under the same
                        procedures as locals by opening an SCD account and
                        trading through licensed brokers.
                      </p>

                      <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20 lg:ml-auto">
                        <strong>
                          Q4: What types of orders can I place on the Uganda
                          Securities Exchange?
                        </strong>
                        <br />
                        You can place limit orders, which specify the price at
                        which you want to buy or sell, or market orders, which
                        execute immediately at the best available price.
                      </p>

                      <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20 lg:ml-auto">
                        <strong>
                          Q5: Are dividends guaranteed when I buy Ugandan
                          stocks?
                        </strong>
                        <br />
                        Dividends depend on company profits and board decisions.
                        While many companies pay regular dividends, they are not
                        guaranteed and may fluctuate with market conditions.
                      </p>

                      <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20 lg:ml-auto">
                        <strong>
                          Q6: How can I sell my shares and access the funds?
                        </strong>
                        <br />
                        You sell shares by instructing your broker to post a
                        sell order on the Automated Trading System (ATS). Once
                        matched with a buyer, the shares are debited from your
                        SCD account and the sale proceeds transferred to your
                        bank account.
                      </p>

                      <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20 lg:ml-auto">
                        <strong>
                          Q7: What risks should I be aware of when investing in
                          Ugandan stocks?
                        </strong>
                        <br />
                        Risks include price volatility due to economic,
                        political, or sector-specific changes. It's important to
                        diversify, research thoroughly, and consider
                        professional advice.
                      </p>

                      <p className="my-6 text-22 leading-35 lg:w-1/2 lg:pl-3/20 lg:ml-auto">
                        <strong>
                          Q8: How can I track my investment performance on the
                          Uganda Securities Exchange?
                        </strong>
                        <br />
                        The USE regularly publishes market performance reports
                        and statistics. Licensed brokers and advisory firms can
                        also provide updates and portfolio management services.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative py-36 flex justify-center">
              <div
                className="ctaCircle tracking-wide uppercase text-13 leading-13 font-bold cta-homepage ctaVisible"
                data-follow-link
              >
                <div className="relative w-full h-full">
                  <a
                    target="_self"
                    href="/bankable-projects"
                    className="anchor"
                  >
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
