import axios from "axios";
import { useEffect, useState } from "react";
import ReactCodeInput from "react-code-input";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { useSearchParams } from "next/navigation";
import Layout from "./Layout";

const Form = () => {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [verifyButtonDisabled, setVerifyButtonDisabled] = useState(false);
  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    phone: false,
    accreditedInvestor: false,
  });

  const [accreditedInvestor, setAccreditedInvestor] = useState(false);

  useEffect(() => {
    if (searchParams.get("direct")) {
      setPage(9);
    }
  }, [searchParams]);

  // console.log(formErrors)
  const [payload, setPayload] = useState([
    {
      question: "What type of investor are you?",
      number: 1,
      selected: "",
      answer: "",
    },
    {
      question: "What is your primary investment goal?",
      number: 2,
      selected: "",
      answer: "",
    },
    {
      question: "What is your ticket size?",
      number: 3,
      selected: "",
      answer: "",
    },
    {
      question: "What type of financing do you provide? ",
      number: 4,
      selected: "",
      answer: "",
    },
    {
      question: "Where are you looking to invest?",
      number: 5,
      selected: "",
      answer: "",
    },
    {
      question: "Are you comfortable to be the lead investor?",
      number: 6,
      selected: "",
      answer: "",
    },
    {
      question: "Yes,I am looking for following industries",
      number: 7,
      selected: "",
      answer: "",
    },
    {
      question: "Business Models",
      number: 8,
      selected: "",
      answer: "",
    },
    {
      question: "Partner investors reference code",
      number: 9,
      selected: "",
      answer: "",
    },
  ]);

  // console.log(payload)
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  // console.log(userInfo)

  const [otp, setotp] = useState("");
  const [otpState, setotpState] = useState(false);
  const [final, setfinal] = useState("");
  const [showCaptcha, setShowCaptcha] = useState(true);
  const [otpError, setotpError] = useState({
    error: false,
    message: "Something went wrong please try again or enter a new number",
  });
  // console.log(otpError)

  const handleOnChange = (event, question, answer) => {
    let newArray = [];
    payload.forEach((ques) => {
      let newObj = {
        ...ques,
      };
      if (ques.number === question) {
        newObj.selected = event.target.id;
        newObj.answer = answer;
      }
      newArray.push(newObj);
    });

    setPayload(newArray);
    setPage(page + 1);
  };

  const handleOnInputChange = (value, question) => {
    let newArray = [];
    payload.forEach((ques) => {
      let newObj = {
        ...ques,
      };
      if (ques.number === question) {
        newObj.answer = value;
      }
      newArray.push(newObj);
    });
    setPayload(newArray);
  };

  const handleSignupFormChange = (event) => {
    // console.log("event", event);
    setUserInfo({ ...userInfo, [event.target.name]: event.target.value });
  };

  // const validateEmail = (email) => {
  //   return String(email)
  //     .toLowerCase()
  //     .match(
  //       /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  //     );
  // };

  const submit = () => {
    // debugger;

    if (buttonDisabled) {
      return;
    }

    setotpError({
      error: false,
      message: "Something went wrong please try again or enter a new number",
    });

    setButtonDisabled(true);

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = userInfo.email && emailRegex.test(userInfo.email);

    const errorObj = {
      name: userInfo.name === "" ? true : false,
      email: !userInfo.email || !isValidEmail ? true : false,
      phone: !userInfo.phone || userInfo.phone.length < 10 ? true : false,
      accreditedInvestor: !accreditedInvestor,
    };

    setFormErrors(errorObj);

    let error = false;
    for (const argumentsKey in errorObj) {
      if (errorObj[argumentsKey] === true) {
        error = true;
      }
    }

    if (error) {
      setButtonDisabled(false);
      return;
    }
    // TEMPORARY: Bypass OTP for testing
    // setShowCaptcha(true);
    // phoneVerification();
    sendEmail();
  };

  const phoneVerification = () => {
    // Send OTP via API
    axios
      .post("/api/investors/send-otp", {
        phone: userInfo.phone,
      })
      .then((response) => {
        console.log(response.data.message);
        setButtonDisabled(false); // Enable buttons/UI
        setVerifyButtonDisabled(false);
        setShowCaptcha(false);
        setotpState(true); // Show OTP input
      })
      .catch((err) => {
        console.error("OTP Error:", err);
        let msg = "An error occurred";
        if (err.response && err.response.data && err.response.data.message) {
          msg = err.response.data.message;
        } else if (err.message) {
          msg = err.message;
        }
        window.alert(msg);
        setShowCaptcha(false);
        setButtonDisabled(false);
        setVerifyButtonDisabled(false);
      });
  };

  const verifyOtp = async () => {
    // setHideBtnOtp(true);
    if (verifyButtonDisabled) {
      return;
    }
    setVerifyButtonDisabled(true);

    axios
      .post("/api/investors/verify-otp", {
        phone: userInfo.phone,
        otp: otp,
      })
      .then((result) => {
        // handleSubmit(formData);
        sendEmail();
      })
      .catch((error) => {
        window.alert(
          error.response && error.response.data
            ? error.response.data.message
            : error.message,
        );
        setotpError({
          error: true,
          message:
            "Something went wrong please try again or enter a new number",
        });
        setShowCaptcha(false);
        setButtonDisabled(false);
        setotpState(false);
        setVerifyButtonDisabled(false);
        return;
      });
  };

  const sendEmail = () => {
    const body = {
      questions: payload,
      user: userInfo,
    };

    axios
      .post("/api/investors/question", body)
      .then(async (response) => {
        await axios.post("/api/investors/email", body);
        setUserInfo({
          name: "",
          email: "",
          phone: "",
        });
        setPayload([
          {
            question: "At what stage is your startup right now?",
            number: 1,
            selected: "",
            answer: "",
          },
          {
            question: "How are you currently funded?",
            number: 2,
            selected: "",
            answer: "",
          },
          {
            question: "How Are You Looking for Investors?",
            number: 3,
            selected: "",
            answer: "",
          },
          {
            question: "How Much Experience Do You Have As an Entrepreneur?",
            number: 4,
            selected: "",
            answer: "",
          },
          {
            question:
              "How Much Time Do You Think You Need For Your Next Funding?",
            number: 5,
            selected: "",
            answer: "",
          },
          {
            question: "Where are you looking to invest?",
            number: 6,
            selected: "",
            answer: "",
          },
          {
            question: "Are you comfortable to be the lead investor?",
            number: 7,
            selected: "",
            answer: "",
          },
        ]);
        setotpState(false);
        setPage(page + 1);
        setButtonDisabled(false);
        setVerifyButtonDisabled(false);
      })
      .catch((error) => {
        window.alert(error.message);
        setButtonDisabled(false);
        setVerifyButtonDisabled(false);
      });
  };

  return (
    <Layout>
      <div>
        {page == 0 && (
          <div
            id="start"
            name="startup-stage"
            data-type="user"
            className="with-avatar"
            data-header="header"
            style={{ padding: "5%" }}
          >
            <div className="block" data-blocktype="rich-text">
              <div className="block-content text-block align-center inner-mid">
                <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                  <h2 style={{ color: "#fff" }}>
                    Let Us Ask a Few Question to Help You Better&nbsp;
                  </h2>
                  <h3>
                    <br />
                  </h3>
                  <h3 style={{ color: "#fff" }}>
                    What type of investor are you?
                  </h3>
                </div>
              </div>
            </div>
            <div className="block" data-blocktype="multiple-choice">
              <div
                className="block-content multiple-choice-block inner-mid"
                data-align-siblings="false"
              >
                <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                  {/* //////////////////////////////////////////////////////// */}
                  <div className="multiple-choice mc-smart-flex picture">
                    <div className="multiple-choice-inner">
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen="screen-d8ffb788"
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">1</div>
                            <input
                              // onClick="heyflow.navigation.navigate('go','screen-d8ffb788');"
                              onChange={(e) => {
                                handleOnChange(e, 1, "Business Angel");
                              }}
                              type="radio"
                              id="mco-cacf406e"
                              data-type="multiple-choice"
                              data-label="Startup Stage"
                              name="mc-7104fe52"
                              data-variable=""
                              value={payload[1].selected}
                              data-conditional="true"
                              data-answer="Business Angel"
                              data-destination="screen-d8ffb788"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <line
                                      x1="3.75"
                                      y1="16.5"
                                      x2="3.75"
                                      y2="13.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M6.75,16.5a1.5,1.5,0,0,1-3,0v3a1.5,1.5,0,0,1-3,0V8.25a2.247,2.247,0,0,1,.793-1.715"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="20.25"
                                      y1="16.5"
                                      x2="20.25"
                                      y2="13.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M17.25,16.5a1.5,1.5,0,0,0,3,0v3a1.5,1.5,0,0,0,3,0V8.25a2.247,2.247,0,0,0-.793-1.715"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M12,16.125,5.608,9.457A3.785,3.785,0,0,1,4.9,5.091h0a3.782,3.782,0,0,1,6.057-.983L12,5.152l1.044-1.044a3.782,3.782,0,0,1,6.057.983h0a3.783,3.783,0,0,1-.709,4.366Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Business Angel</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen="screen-d8ffb788"
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">2</div>
                            <input
                              // onClick="heyflow.navigation.navigate('go','screen-d8ffb788');"
                              onChange={(e) => {
                                handleOnChange(e, 1, "Super-Angel");
                              }}
                              type="radio"
                              id="mco-5ed5b7c5"
                              data-type="multiple-choice"
                              data-label="Startup Stage"
                              name="mc-7104fe52"
                              data-variable=""
                              value={payload[1].selected}
                              data-conditional="true"
                              data-answer="Super-Angel  "
                              data-destination="screen-d8ffb788"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>app-window-cash</title>
                                    <rect
                                      x="1.51"
                                      y="2.253"
                                      width="21"
                                      height="19.5"
                                      rx="1.5"
                                      ry="1.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></rect>
                                    <line
                                      x1="1.51"
                                      y1="6.753"
                                      x2="22.51"
                                      y2="6.753"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M13.885,11.253H11.852a1.342,1.342,0,0,0-.5,2.588l2.064.825a1.342,1.342,0,0,1-.5,2.587H10.885"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="12.385"
                                      y1="11.253"
                                      x2="12.385"
                                      y2="10.503"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="12.385"
                                      y1="18.003"
                                      x2="12.385"
                                      y2="17.253"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Super-Angel</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen="screen-d8ffb788"
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">3</div>
                            <input
                              // onClick="heyflow.navigation.navigate('go','screen-d8ffb788');"
                              onChange={(e) => {
                                handleOnChange(e, 1, "Venture Capital Fund");
                              }}
                              type="radio"
                              id="mco-db4672ad"
                              data-type="multiple-choice"
                              data-label="Startup Stage"
                              name="mc-7104fe52"
                              data-variable=""
                              value={payload[1].selected}
                              data-conditional="true"
                              data-answer="Venture Capital Fund"
                              data-destination="screen-d8ffb788"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>database-cash</title>
                                    <path
                                      d="M12,9.751C5.787,9.751.75,7.736.75,5.251S5.787.751,12,.751s11.25,2.014,11.25,4.5c0,1.182-1.14,2.258-3,3.061"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="23.25"
                                      y1="9.751"
                                      x2="23.25"
                                      y2="5.251"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M.75,5.251v6c0,1.96,3.132,3.627,7.5,4.244"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M.75,11.251v6c0,2.065,3.479,3.806,8.221,4.335"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M18.75,14.251H16.717a1.342,1.342,0,0,0-.5,2.587l2.064.825a1.342,1.342,0,0,1-.5,2.588H15.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="17.25"
                                      y1="14.251"
                                      x2="17.25"
                                      y2="13.501"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="17.25"
                                      y1="21.001"
                                      x2="17.25"
                                      y2="20.251"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <circle
                                      cx="17.25"
                                      cy="17.251"
                                      r="6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">
                                  Venture Capital Fund
                                </div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen="screen-d8ffb788"
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">4</div>
                            <input
                              // onClick="heyflow.navigation.navigate('go','screen-d8ffb788');"
                              onChange={(e) => {
                                handleOnChange(
                                  e,
                                  1,
                                  "Corporate Venture Capital Fund",
                                );
                              }}
                              type="radio"
                              id="mco-f14bfb5a"
                              data-type="multiple-choice"
                              data-label="Startup Stage"
                              name="mc-7104fe52"
                              data-variable=""
                              value={payload[1].selected}
                              data-conditional="true"
                              data-answer="Corporate Venture Capital Fund"
                              data-destination="screen-d8ffb788"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>water-dam</title>
                                    <path
                                      d="M15,13.5l4.915-2.457A.75.75,0,0,1,21,11.714V21.75a1.5,1.5,0,0,1-1.5,1.5H3a1.5,1.5,0,0,1-1.5-1.5V13.5L3.623,3.593A.75.75,0,0,1,4.356,3H6.144a.75.75,0,0,1,.733.593L9,13.5l4.915-2.457A.75.75,0,0,1,15,11.714V13.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="9"
                                      y1="17.25"
                                      x2="12"
                                      y2="17.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="9"
                                      y1="20.25"
                                      x2="12"
                                      y2="20.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="15"
                                      y1="17.25"
                                      x2="18"
                                      y2="17.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="15"
                                      y1="20.25"
                                      x2="18"
                                      y2="20.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M9.005.869A6.954,6.954,0,0,1,12,1.491C19.429,4.662,22.5.75,22.5.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">
                                  Corporate Venture Capital Fund
                                </div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      {/* /////////////////////////////////////// */}
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen="screen-d8ffb788"
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">5</div>
                            <input
                              // onClick="heyflow.navigation.navigate('go','screen-d8ffb788');"
                              onChange={(e) => {
                                handleOnChange(e, 1, "Accelerator");
                              }}
                              type="radio"
                              id="mco-f14bfb5a"
                              data-type="multiple-choice"
                              data-label="Startup Stage"
                              name="mc-7104fe52"
                              data-variable=""
                              value={payload[1].selected}
                              data-conditional="true"
                              data-answer="Accelerator"
                              data-destination="screen-d8ffb788"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>button-fast-forward-1</title>
                                    <circle
                                      cx="12"
                                      cy="11.998"
                                      r="11.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <path
                                      d="M14.716,7.964A1.591,1.591,0,0,0,12,9.089V10.5L9.466,7.964A1.591,1.591,0,0,0,6.75,9.089v5.819a1.592,1.592,0,0,0,2.716,1.125L12,13.5v1.41a1.592,1.592,0,0,0,2.716,1.125L18.75,12Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Accelerator</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      {/* ///////////////////////////////////////////// */}
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen="screen-d8ffb788"
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">6</div>
                            <input
                              // onClick="heyflow.navigation.navigate('go','screen-d8ffb788');"
                              onChange={(e) => {
                                handleOnChange(e, 1, "Crowdfunding Platform");
                              }}
                              type="radio"
                              id="mco-f14bfb5a"
                              data-type="multiple-choice"
                              data-label="Startup Stage"
                              name="mc-7104fe52"
                              data-variable=""
                              value={payload[1].selected}
                              data-conditional="true"
                              data-answer="Crowdfunding Platform"
                              data-destination="screen-d8ffb788"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>fireworks-people-watch</title>
                                    <circle
                                      cx="3.375"
                                      cy="16.875"
                                      r="2.625"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <circle
                                      cx="20.625"
                                      cy="16.875"
                                      r="2.625"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <circle
                                      cx="12"
                                      cy="16.875"
                                      r="2.625"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <path
                                      d="M7.688,23.25A4.585,4.585,0,0,0,.75,21.083"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M16.313,23.25a4.584,4.584,0,0,1,6.937-2.167"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M16.313,23.25a4.6,4.6,0,0,0-8.626,0"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M14.25,11.25S15,7.5,18,6.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="20.25"
                                      y1="6"
                                      x2="23.25"
                                      y2="6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="21.75"
                                      y1="4.5"
                                      x2="21.75"
                                      y2="7.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M9.75,11.25S9,7.5,6,6.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="3.75"
                                      y1="6"
                                      x2="0.75"
                                      y2="6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="2.25"
                                      y1="4.5"
                                      x2="2.25"
                                      y2="7.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="10.5"
                                      y1="2.25"
                                      x2="13.5"
                                      y2="2.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="12"
                                      y1="0.75"
                                      x2="12"
                                      y2="3.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="12"
                                      y1="11.25"
                                      x2="12"
                                      y2="6.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">
                                  Crowdfunding Platform
                                </div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      {/* ///////////////////////////////////////////// */}{" "}
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen="screen-d8ffb788"
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">7</div>
                            <input
                              // onClick="heyflow.navigation.navigate('go','screen-d8ffb788');"
                              onChange={(e) => {
                                handleOnChange(e, 1, "Family Office");
                              }}
                              type="radio"
                              id="mco-f14bfb5a"
                              data-type="multiple-choice"
                              data-label="Startup Stage"
                              name="mc-7104fe52"
                              data-variable=""
                              value={payload[1].selected}
                              data-conditional="true"
                              data-answer="Family Office"
                              data-destination="screen-d8ffb788"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>family-child</title>
                                    <circle
                                      cx="19.5"
                                      cy="5.25"
                                      r="3"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <path
                                      d="M17.812,20.25,18,21.75h3l.75-6h1.5V13.5a3.75,3.75,0,0,0-6-3"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <circle
                                      cx="4.5"
                                      cy="5.25"
                                      r="3"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <path
                                      d="M6.188,20.25,6,21.75H3l-.75-6H.75V13.5a3.75,3.75,0,0,1,6-3"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <circle
                                      cx="12"
                                      cy="9"
                                      r="2.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <path
                                      d="M12,12.75A3.75,3.75,0,0,0,8.25,16.5v.75h1.5l.75,4.5H12"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M12,12.75a3.75,3.75,0,0,1,3.75,3.75v.75h-1.5l-.75,4.5H12"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Family Office</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      {/* ///////////////////////////////////////////// */}{" "}
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen="screen-d8ffb788"
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">8</div>
                            <input
                              // onClick="heyflow.navigation.navigate('go','screen-d8ffb788');"
                              onChange={(e) => {
                                handleOnChange(e, 1, "Other");
                              }}
                              type="radio"
                              id="mco-f14bfb5a"
                              data-type="multiple-choice"
                              data-label="Startup Stage"
                              name="mc-7104fe52"
                              data-variable=""
                              value={payload[1].selected}
                              data-conditional="true"
                              data-answer="Other"
                              data-destination="screen-d8ffb788"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>cursor-information</title>
                                    <circle
                                      cx="9.75"
                                      cy="14.247"
                                      r="9"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <polygon
                                      points="23.25 0.747 15.75 0.747 23.25 8.247 23.25 0.747"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></polygon>
                                    <polyline
                                      points="8.25 12.747 9.75 12.747 9.75 18.747"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></polyline>
                                    <line
                                      x1="8.25"
                                      y1="18.747"
                                      x2="11.25"
                                      y2="18.747"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M9.75,9a.375.375,0,1,0,.375.375A.375.375,0,0,0,9.75,9h0"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Other</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      {/* ///////////////////////////////////////////// */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {page == 1 && (
          <div
            id="screen-d8ffb788"
            name="funding-search"
            data-type="user"
            className="undefined with-avatar"
            data-header="header"
            style={{ padding: "5%" }}
          >
            <div className="block" data-blocktype="rich-text">
              <div className="block-content text-block align-center inner-mid">
                <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                  <h2 style={{ color: "#fff" }}>
                    What is your primary investment goal?
                  </h2>
                </div>
              </div>
            </div>
            <div className="block" data-blocktype="multiple-choice">
              <div
                className="block-content multiple-choice-block inner-mid"
                data-align-siblings="false"
              >
                <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                  {/* //////////////////////////////////////////////////////// */}
                  <div className="multiple-choice mc-smart-flex picture">
                    <div className="multiple-choice-inner">
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">1</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              type="radio"
                              onChange={(e) => {
                                handleOnChange(e, 2, "Investment Returns");
                              }}
                              id="mco-5c41a271"
                              data-type="multiple-choice"
                              data-label="Funding Search"
                              name="mc-9a2f80dd"
                              data-variable=""
                              value={payload[2].selected}
                              data-conditional="true"
                              data-answer="Investment Returns"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>money-bag-dollar</title>
                                    <path
                                      d="M13.574,12.75H11.541a1.342,1.342,0,0,0-.5,2.587l2.064.826a1.342,1.342,0,0,1-.5,2.587H10.574"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="12.074"
                                      y1="12.75"
                                      x2="12.074"
                                      y2="12"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="12.074"
                                      y1="19.5"
                                      x2="12.074"
                                      y2="18.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="6.824"
                                      y1="8.25"
                                      x2="17.324"
                                      y2="8.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M15.63,5.036,17.068,2.16a.75.75,0,0,0-1.006-1.006l-1.9.948a.75.75,0,0,1-.959-.255L12.7,1.084a.75.75,0,0,0-1.248,0l-.509.763a.749.749,0,0,1-.959.255L8.087,1.154A.751.751,0,0,0,7.08,2.16L8.49,4.98"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M7.237,10.5l-2.76,3.2a5.932,5.932,0,0,0,4.7,9.549h5.79a5.932,5.932,0,0,0,4.7-9.549l-2.76-3.2"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Investment Returns</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">2</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 2, "Social Impact");
                              }}
                              type="radio"
                              id="mco-dcbb33ba"
                              data-type="multiple-choice"
                              data-label="Funding Search"
                              name="mc-9a2f80dd"
                              data-variable=""
                              value={payload[2].selected}
                              data-conditional="true"
                              data-answer="Social Impact"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>award-ribbon-star-2</title>
                                    <path
                                      d="M12.531,5.042,13.78,7.5h2.126a.582.582,0,0,1,.419,1l-1.952,1.922L15.455,12.9a.59.59,0,0,1-.84.737L12,12.169,9.385,13.64a.589.589,0,0,1-.839-.737l1.082-2.485L7.675,8.5a.582.582,0,0,1,.42-1h2.126L11.47,5.042A.6.6,0,0,1,12.531,5.042Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <polyline
                                      points="4.717 13.152 0.75 18 4.5 18.75 6 23.25 9.991 16.918"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></polyline>
                                    <polyline
                                      points="19.283 13.152 23.25 18 19.5 18.75 18 23.25 14.01 16.918"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></polyline>
                                    <path
                                      d="M12.471.916,14.318,2.4l2.369-.118a.75.75,0,0,1,.761.553l.62,2.29,1.986,1.3a.752.752,0,0,1,.291.9L19.5,9.537l.845,2.216a.751.751,0,0,1-.291.895l-1.986,1.3-.62,2.29a.75.75,0,0,1-.761.553l-2.369-.118-1.847,1.488a.751.751,0,0,1-.941,0L9.683,16.67l-2.369.118a.751.751,0,0,1-.762-.553l-.619-2.29-1.986-1.3a.748.748,0,0,1-.291-.895L4.5,9.537,3.656,7.32a.749.749,0,0,1,.291-.9l1.986-1.3.619-2.29a.751.751,0,0,1,.762-.553L9.683,2.4,11.53.916A.751.751,0,0,1,12.471.916Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Social Impact</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">3</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 2, "Strategic Investments");
                              }}
                              type="radio"
                              id="mco-51872d1a"
                              data-type="multiple-choice"
                              data-label="Funding Search"
                              name="mc-9a2f80dd"
                              data-variable=""
                              value={payload[2].selected}
                              data-conditional="true"
                              data-answer="Strategic Investments"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>chess-figures</title>
                                    <path
                                      d="M15.75,18h5.479a1.5,1.5,0,0,1,1.48,1.253l.521,1.5A1.5,1.5,0,0,1,21.75,22.5H16.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M2.812,18V16.9A9.159,9.159,0,0,1,6.25,9.75H2.208A1.459,1.459,0,0,1,1.177,7.26l3.7-3.7V1.5l.364.081A7.429,7.429,0,0,1,11.055,8.84v.91c-3.437,3.438.69,8.27.69,8.27"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="15.092"
                                      y1="9.241"
                                      x2="14.045"
                                      y2="15"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="20.25"
                                      y1="18"
                                      x2="18.658"
                                      y2="9.243"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <circle
                                      cx="16.875"
                                      cy="6.375"
                                      r="3.375"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <path
                                      d="M13.423,20.526l-.5-1.5A1.5,1.5,0,0,0,11.5,18H2.75a1.5,1.5,0,0,0-1.423,1.026l-.5,1.5A1.5,1.5,0,0,0,2.25,22.5H12a1.5,1.5,0,0,0,1.423-1.974Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">
                                  Strategic Investments
                                </div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">4</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 2, "Buyout");
                              }}
                              type="radio"
                              id="mco-23de6177"
                              data-type="multiple-choice"
                              data-label="Funding Search"
                              name="mc-9a2f80dd"
                              data-variable=""
                              value={payload[2].selected}
                              data-conditional="true"
                              data-answer="Buyout"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>
                                      real-estate-insurance-dollar-hand
                                    </title>
                                    <line
                                      x1="0.75"
                                      y1="14.25"
                                      x2="0.75"
                                      y2="23.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M15.75,21.75a3,3,0,0,0-3-3H9a3,3,0,0,0-3-3H.75v6Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="6"
                                      y1="18.75"
                                      x2="9"
                                      y2="18.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M10.5,9v5.25a1.5,1.5,0,0,0,1.5,1.5h7.5a1.5,1.5,0,0,0,1.5-1.5V9"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M23.25,6.982l-6.5-5.847a1.5,1.5,0,0,0-2.006,0L8.25,6.982"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M17.25,6H14.842a1.342,1.342,0,0,0-.5,2.587l2.814.826a1.342,1.342,0,0,1-.5,2.587H14.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="15.75"
                                      y1="6"
                                      x2="15.75"
                                      y2="5.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="15.75"
                                      y1="12.75"
                                      x2="15.75"
                                      y2="12"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Buyout</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">5</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 2, "Other");
                              }}
                              type="radio"
                              id="option-be68ddbd"
                              data-type="multiple-choice"
                              data-label="Funding Search"
                              name="mc-9a2f80dd"
                              data-variable=""
                              value={payload[2].selected}
                              data-conditional="true"
                              data-answer="Other "
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>cursor-information</title>
                                    <circle
                                      cx="9.75"
                                      cy="14.247"
                                      r="9"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <polygon
                                      points="23.25 0.747 15.75 0.747 23.25 8.247 23.25 0.747"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></polygon>
                                    <polyline
                                      points="8.25 12.747 9.75 12.747 9.75 18.747"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></polyline>
                                    <line
                                      x1="8.25"
                                      y1="18.747"
                                      x2="11.25"
                                      y2="18.747"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M9.75,9a.375.375,0,1,0,.375.375A.375.375,0,0,0,9.75,9h0"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Other</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {page == 2 && (
          <div
            id="screen-82dd5877"
            name="investor-search"
            data-type="user"
            className="undefined with-avatar"
            data-header="header"
            style={{ padding: "5%" }}
          >
            <div className="block" data-blocktype="rich-text">
              <div className="block-content text-block align-center inner-mid">
                <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                  <h2 style={{ color: "#fff" }}>What is your ticket size?</h2>
                </div>
              </div>
            </div>
            <div className="block" data-blocktype="multiple-choice">
              <div
                className="block-content multiple-choice-block inner-mid"
                data-align-siblings="false"
              >
                <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                  {/* //////////////////////////////////////////////////////// */}
                  <div className="multiple-choice mc-smart-flex picture">
                    <div className="multiple-choice-inner">
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">1</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 3, "< 100.000 $");
                              }}
                              type="radio"
                              id="mco-f3926ff4"
                              data-type="multiple-choice"
                              data-label="< 100.000 $"
                              name="mc-f5c6f017"
                              data-variable=""
                              value={payload[3].selected}
                              data-conditional="true"
                              data-answer="< 100.000 $"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>love-it-angel</title>
                                    <line
                                      x1="3.75"
                                      y1="16.5"
                                      x2="3.75"
                                      y2="13.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M6.75,16.5a1.5,1.5,0,0,1-3,0v3a1.5,1.5,0,0,1-3,0V8.25a2.247,2.247,0,0,1,.793-1.715"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="20.25"
                                      y1="16.5"
                                      x2="20.25"
                                      y2="13.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M17.25,16.5a1.5,1.5,0,0,0,3,0v3a1.5,1.5,0,0,0,3,0V8.25a2.247,2.247,0,0,0-.793-1.715"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M12,16.125,5.608,9.457A3.785,3.785,0,0,1,4.9,5.091h0a3.782,3.782,0,0,1,6.057-.983L12,5.152l1.044-1.044a3.782,3.782,0,0,1,6.057.983h0a3.783,3.783,0,0,1-.709,4.366Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">&lt; 100.000 $</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">2</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 3, "100k - 250k $");
                              }}
                              type="radio"
                              id="mco-7a9a5701"
                              data-type="multiple-choice"
                              data-label="Ways to look for investors"
                              name="mc-f5c6f017"
                              data-variable=""
                              value={payload[3].selected}
                              data-conditional="true"
                              data-answer="100k - 250k $"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>calendar-cash</title>
                                    <rect
                                      x="0.75"
                                      y="3.75"
                                      width="22.5"
                                      height="19.5"
                                      rx="1.5"
                                      ry="1.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></rect>
                                    <line
                                      x1="0.75"
                                      y1="9.75"
                                      x2="23.25"
                                      y2="9.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="6.75"
                                      y1="6"
                                      x2="6.75"
                                      y2="0.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="17.25"
                                      y1="6"
                                      x2="17.25"
                                      y2="0.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M13.5,13.5H11.467a1.342,1.342,0,0,0-.5,2.588l2.064.825a1.342,1.342,0,0,1-.5,2.587H10.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="12"
                                      y1="13.5"
                                      x2="12"
                                      y2="12.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="12"
                                      y1="20.25"
                                      x2="12"
                                      y2="19.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">100k - 250k $</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">3</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 3, "250k - 1 mn $");
                              }}
                              type="radio"
                              id="option-4dfe0e6e"
                              data-type="multiple-choice"
                              data-label="250k - 1 mn $"
                              name="mc-f5c6f017"
                              data-variable=""
                              value={payload[3].selected}
                              data-conditional="true"
                              data-answer="Events"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>calendar-cash-1</title>
                                    <path
                                      d="M18.75,14.25H16.717a1.342,1.342,0,0,0-.5,2.588l2.064.825a1.342,1.342,0,0,1-.5,2.587H15.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="17.25"
                                      y1="14.25"
                                      x2="17.25"
                                      y2="13.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="17.25"
                                      y1="21"
                                      x2="17.25"
                                      y2="20.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <circle
                                      cx="17.25"
                                      cy="17.25"
                                      r="6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <path
                                      d="M8.25,17.25h-6a1.5,1.5,0,0,1-1.5-1.5V3.765a1.5,1.5,0,0,1,1.5-1.5h13.5a1.5,1.5,0,0,1,1.5,1.5V8.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="0.75"
                                      y1="6.75"
                                      x2="17.25"
                                      y2="6.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="5.243"
                                      y1="3.75"
                                      x2="5.243"
                                      y2="0.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="12.743"
                                      y1="3.75"
                                      x2="12.743"
                                      y2="0.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">250k - 1 mn $</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">4</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 3, "1-5 mn $");
                              }}
                              type="radio"
                              id="mco-a135488a"
                              data-type="multiple-choice"
                              data-label="1-5 mn $"
                              name="mc-f5c6f017"
                              data-variable=""
                              value={payload[3].selected}
                              data-conditional="true"
                              data-answer="My network"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>laptop-cash</title>
                                    <path
                                      d="M18.75,14.25H16.717a1.342,1.342,0,0,0-.5,2.587l2.064.826a1.342,1.342,0,0,1-.5,2.587H15.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="17.25"
                                      y1="14.25"
                                      x2="17.25"
                                      y2="13.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="17.25"
                                      y1="21"
                                      x2="17.25"
                                      y2="20.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <circle
                                      cx="17.25"
                                      cy="17.25"
                                      r="6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <path
                                      d="M3,12V2.25A1.5,1.5,0,0,1,4.5.75h15A1.5,1.5,0,0,1,21,2.25v6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M9.75,12h-9A3.75,3.75,0,0,0,4.5,15.75H8.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">1-5 mn $</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">5</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 3, "> 5 mn $");
                              }}
                              type="radio"
                              id="mco-26eba467"
                              data-type="multiple-choice"
                              data-label="> 5 mn $"
                              name="mc-f5c6f017"
                              data-variable=""
                              value={payload[3].selected}
                              data-conditional="true"
                              data-answer="We try other services"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>database-cash</title>
                                    <path
                                      d="M12,9.751C5.787,9.751.75,7.736.75,5.251S5.787.751,12,.751s11.25,2.014,11.25,4.5c0,1.182-1.14,2.258-3,3.061"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="23.25"
                                      y1="9.751"
                                      x2="23.25"
                                      y2="5.251"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M.75,5.251v6c0,1.96,3.132,3.627,7.5,4.244"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M.75,11.251v6c0,2.065,3.479,3.806,8.221,4.335"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M18.75,14.251H16.717a1.342,1.342,0,0,0-.5,2.587l2.064.825a1.342,1.342,0,0,1-.5,2.588H15.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="17.25"
                                      y1="14.251"
                                      x2="17.25"
                                      y2="13.501"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="17.25"
                                      y1="21.001"
                                      x2="17.25"
                                      y2="20.251"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <circle
                                      cx="17.25"
                                      cy="17.251"
                                      r="6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">&gt; 5 mn $</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {page == 3 && (
          <div
            id="screen-8e9082ac"
            name="entrepreneur-experience"
            data-type="user"
            className="undefined with-avatar"
            data-header="header"
            style={{ padding: "5%" }}
          >
            <div className="block" data-blocktype="rich-text">
              <div className="block-content text-block align-center inner-mid">
                <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                  <h2 style={{ color: "#fff" }}>
                    What type of financing do you provide?{" "}
                  </h2>
                </div>
                <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                  <h4 style={{ color: "#fff" }}>
                    We will get more specific with the next question.
                  </h4>
                </div>
              </div>
            </div>
            <div className="block" data-blocktype="multiple-choice">
              <div
                className="block-content multiple-choice-block inner-mid"
                data-align-siblings="false"
              >
                <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                  {/* //////////////////////////////////////////////////////// */}
                  <div className="multiple-choice mc-smart-flex picture">
                    <div className="multiple-choice-inner">
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">1</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 4, "Early Stage Capital");
                              }}
                              type="radio"
                              id="mco-7cc37a4c"
                              data-type="multiple-choice"
                              data-label="Entrepreneur Experience"
                              name="mc-7f337c89"
                              data-variable=""
                              value={payload[4].selected}
                              data-conditional="true"
                              data-answer="Early Stage Capital"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>alarm-bell-ring</title>
                                    <path
                                      d="M6.814,4.266a6.35,6.35,0,0,0-2.47,2.471"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M5.975,1.5A6.5,6.5,0,0,0,1.5,5.976"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="4.5"
                                      y1="18"
                                      x2="19.5"
                                      y2="18"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M19.5,18S18,16.694,18,12c0-3.75-2.562-7.068-6-7.068S6,8.25,6,12c0,4.719-1.5,6-1.5,6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M13.5,21a1.5,1.5,0,0,1-3,0"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="12"
                                      y1="4.932"
                                      x2="12"
                                      y2="3"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M17.186,4.266a6.456,6.456,0,0,1,1.408,1.062,6.391,6.391,0,0,1,1.062,1.409"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M18.025,1.5A6.5,6.5,0,0,1,22.5,5.976"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Early Stage Capital</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">2</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 4, "Growth Equity");
                              }}
                              type="radio"
                              id="mco-7cce07dd"
                              data-type="multiple-choice"
                              data-label="Growth Equity"
                              name="mc-7f337c89"
                              data-variable=""
                              value={payload[4].selected}
                              data-conditional="true"
                              data-answer="1-2 years"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>laptop-launch</title>
                                    <path
                                      d="M13.776,15.527c0,1.486-1.9,3.473-1.9,3.473s-1.9-1.987-1.9-3.473a1.9,1.9,0,1,1,3.791,0Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M13.88,4.5c0-1.657-2-3-2-3s-2,1.343-2,3v7h4Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M9.88,11.5H7.446a.5.5,0,0,1-.484-.624A4.343,4.343,0,0,1,9.88,8"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M13.88,11.5h2.434a.5.5,0,0,0,.485-.624A4.353,4.353,0,0,0,13.88,8"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M8.88,13.5a1,1,0,0,0-1,.5.549.549,0,0,0,0,.5h-.5A1.545,1.545,0,0,0,5.88,16"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M14.88,13.5a1,1,0,0,1,1,.5.546.546,0,0,1,0,.5h.5a1.544,1.544,0,0,1,1.5,1.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M19.38,17.5a1.114,1.114,0,0,1,1.029.5l2.471,3a1.061,1.061,0,0,1-1,1.5H2.361A1.051,1.051,0,0,1,1.38,21l2.45-3a1,1,0,0,1,.864-.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M7.879,5.5h-3a1,1,0,0,0-1,1v10c0,.552-.052,1,.5,1h3.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M15.88,17.5h3.5c.553,0,.5-.448.5-1V6.5a1,1,0,0,0-1-1h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="10.38"
                                      y1="20.5"
                                      x2="13.38"
                                      y2="20.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Growth Equity</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">3</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 4, "Buyouts");
                              }}
                              type="radio"
                              id="mco-64131512"
                              data-type="multiple-choice"
                              data-label="Entrepreneur Experience"
                              name="mc-7f337c89"
                              data-variable=""
                              value={payload[4].selected}
                              data-conditional="true"
                              data-answer="3-5 years"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>business-deal-handshake</title>
                                    <path
                                      d="M13.787,15.726H14s3.453.007,3.5,0l2.18-.4a1,1,0,0,0,.82-.984V8.908a1,1,0,0,0-.635-.931L14.82,6a1.5,1.5,0,0,0-1.5.239L9.655,9.254a.769.769,0,0,0,.729,1.325L14.5,9.226"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M3.5,13.726l2.6.5,3.585,3.585a1,1,0,0,0,.877.279l.5-.087a1,1,0,0,0,.816-.816l.174-1.013,1.709-.295.295-1.708,1.709-.295.294-1.709-2.6-2.6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M11.57,7.678,10.091,6.2A1,1,0,0,0,9,5.982L6,7.226l-2.5.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M.5,6.226h2a1,1,0,0,1,1,1v7a1,1,0,0,1-1,1H.5a0,0,0,0,1,0,0v-9A0,0,0,0,1,.5,6.226Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M21.5,7.226h2a0,0,0,0,1,0,0v9a0,0,0,0,1,0,0h-2a1,1,0,0,1-1-1v-7A1,1,0,0,1,21.5,7.226Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Buyouts</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">4</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 4, "Mezzanine Capital");
                              }}
                              type="radio"
                              id="mco-af36a88d"
                              data-type="multiple-choice"
                              data-label="Entrepreneur Experience"
                              name="mc-7f337c89"
                              data-variable=""
                              value={payload[4].selected}
                              data-conditional="true"
                              data-answer="call me entrepreneur grandparent"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>align-middle-move-horizontal</title>
                                    <polyline
                                      points="18 3.75 16.5 2.232 21.75 2.232"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></polyline>
                                    <line
                                      x1="18"
                                      y1="0.75"
                                      x2="16.5"
                                      y2="2.232"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <polyline
                                      points="6 23.25 7.5 21.732 2.25 21.732"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></polyline>
                                    <line
                                      x1="6"
                                      y1="20.25"
                                      x2="7.5"
                                      y2="21.732"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <rect
                                      x="4.5"
                                      y="6.75"
                                      width="15"
                                      height="3.75"
                                      rx="0.5"
                                      ry="0.5"
                                      transform="translate(24 17.25) rotate(-180)"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></rect>
                                    <rect
                                      x="6.75"
                                      y="13.5"
                                      width="10.5"
                                      height="3.75"
                                      rx="0.5"
                                      ry="0.5"
                                      transform="translate(24 30.75) rotate(-180)"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></rect>
                                    <line
                                      x1="12"
                                      y1="17.25"
                                      x2="12"
                                      y2="23.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="12"
                                      y1="10.5"
                                      x2="12"
                                      y2="13.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="12"
                                      y1="0.75"
                                      x2="12"
                                      y2="6.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Mezzanine Capital</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      {/* /////////////////////////////////////////////// */}
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">5</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 4, "Convertible Debt");
                              }}
                              type="radio"
                              id="mco-af36a88d"
                              data-type="multiple-choice"
                              data-label="Entrepreneur Experience"
                              name="mc-7f337c89"
                              data-variable=""
                              value={payload[4].selected}
                              data-conditional="true"
                              data-answer="call me entrepreneur grandparent"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>vintage-car-convertible</title>
                                    <circle
                                      cx="18.75"
                                      cy="15.5"
                                      r="1.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <circle
                                      cx="6.75"
                                      cy="15.5"
                                      r="1.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <line
                                      x1="17.25"
                                      y1="15.5"
                                      x2="8.25"
                                      y2="15.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="16.5"
                                      y1="9.5"
                                      x2="13.5"
                                      y2="5.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M20.25,15.5a3,3,0,0,0,0-6H16.5c-2.25,1.5-5.25,1.5-8.25,0v-3H7.5c-2.952,0-2.935,3-3,3a3.4,3.4,0,0,0-3.372,2.977L.961,13.814A1.5,1.5,0,0,0,2.449,15.5h2.8"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Convertible Debt</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      {/* /////////////////////////////////////////////// */}{" "}
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">6</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 4, "(Venture) Debt");
                              }}
                              type="radio"
                              id="mco-af36a88d"
                              data-type="multiple-choice"
                              data-label="Entrepreneur Experience"
                              name="mc-7f337c89"
                              data-variable=""
                              value={payload[4].selected}
                              data-conditional="true"
                              data-answer="call me entrepreneur grandparent"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>credit-card-scan</title>
                                    <path
                                      d="M13.5,15h8.25a1.5,1.5,0,0,0,1.5-1.5V2.25a1.5,1.5,0,0,0-1.5-1.5H5.25a1.5,1.5,0,0,0-1.5,1.5V12"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="3.75"
                                      y1="5.25"
                                      x2="23.25"
                                      y2="5.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="6.75"
                                      y1="9.75"
                                      x2="9"
                                      y2="9.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M16.875,9a1.875,1.875,0,1,0,0,2.25,1.875,1.875,0,1,0,0-2.25Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="0.75"
                                      y1="14.25"
                                      x2="0.75"
                                      y2="23.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M.75,21.75h16.5a3,3,0,0,0-3-3H10.5a3,3,0,0,0-3-3H.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="6.75"
                                      y1="18.75"
                                      x2="10.5"
                                      y2="18.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">(Venture) Debt</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      {/* /////////////////////////////////////////////// */}{" "}
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">7</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 4, "Revenue-based");
                              }}
                              type="radio"
                              id="mco-af36a88d"
                              data-type="multiple-choice"
                              data-label="Entrepreneur Experience"
                              name="mc-7f337c89"
                              data-variable=""
                              value={payload[4].selected}
                              data-conditional="true"
                              data-answer="call me entrepreneur grandparent"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>tags-cash</title>
                                    <path
                                      d="M9,19.188a1.5,1.5,0,0,1-2.121,0L1.5,13.81a1.5,1.5,0,0,1,0-2.122L12,1.188A1.5,1.5,0,0,1,13.061.749h5.378a1.5,1.5,0,0,1,1.5,1.5V7.628a1.5,1.5,0,0,1-.439,1.06"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M16.189,4.124a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375h0"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M18.439,14.249H16.406a1.341,1.341,0,0,0-.5,2.587l2.063.826a1.342,1.342,0,0,1-.5,2.587H15.439"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="16.939"
                                      y1="14.249"
                                      x2="16.939"
                                      y2="13.499"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="16.939"
                                      y1="20.999"
                                      x2="16.939"
                                      y2="20.249"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <circle
                                      cx="16.939"
                                      cy="17.249"
                                      r="6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Revenue-based</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      {/* /////////////////////////////////////////////// */}{" "}
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">8</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 4, "Crowdfunding");
                              }}
                              type="radio"
                              id="mco-af36a88d"
                              data-type="multiple-choice"
                              data-label="Entrepreneur Experience"
                              name="mc-7f337c89"
                              data-variable=""
                              value={payload[4].selected}
                              data-conditional="true"
                              data-answer="call me entrepreneur grandparent"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>fireworks-people-watch</title>
                                    <circle
                                      cx="3.375"
                                      cy="16.875"
                                      r="2.625"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <circle
                                      cx="20.625"
                                      cy="16.875"
                                      r="2.625"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <circle
                                      cx="12"
                                      cy="16.875"
                                      r="2.625"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <path
                                      d="M7.688,23.25A4.585,4.585,0,0,0,.75,21.083"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M16.313,23.25a4.584,4.584,0,0,1,6.937-2.167"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M16.313,23.25a4.6,4.6,0,0,0-8.626,0"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M14.25,11.25S15,7.5,18,6.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="20.25"
                                      y1="6"
                                      x2="23.25"
                                      y2="6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="21.75"
                                      y1="4.5"
                                      x2="21.75"
                                      y2="7.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M9.75,11.25S9,7.5,6,6.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="3.75"
                                      y1="6"
                                      x2="0.75"
                                      y2="6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="2.25"
                                      y1="4.5"
                                      x2="2.25"
                                      y2="7.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="10.5"
                                      y1="2.25"
                                      x2="13.5"
                                      y2="2.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="12"
                                      y1="0.75"
                                      x2="12"
                                      y2="3.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="12"
                                      y1="11.25"
                                      x2="12"
                                      y2="6.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Crowdfunding</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      {/* /////////////////////////////////////////////// */}{" "}
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">9</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 4, "Takeover Funding");
                              }}
                              type="radio"
                              id="mco-af36a88d"
                              data-type="multiple-choice"
                              data-label="Entrepreneur Experience"
                              name="mc-7f337c89"
                              data-variable=""
                              value={payload[4].selected}
                              data-conditional="true"
                              data-answer="call me entrepreneur grandparent"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>
                                      business-contract-handshake-sign
                                    </title>
                                    <path
                                      d="M17.25.75H3.75a3,3,0,0,0-3,3v18a1.5,1.5,0,0,0,1.5,1.5H3.685"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="3.75"
                                      y1="4.5"
                                      x2="10.5"
                                      y2="4.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="3.75"
                                      y1="7.5"
                                      x2="10.5"
                                      y2="7.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="3.75"
                                      y1="10.5"
                                      x2="7.109"
                                      y2="10.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M15,9.75V3A2.257,2.257,0,0,1,17.25.75h0A2.256,2.256,0,0,1,19.5,3V4.5H15"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="21.75"
                                      y1="19.61"
                                      x2="16.963"
                                      y2="20.568"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M17.438,15.138l-2.26.954a1.42,1.42,0,0,1-1.122-.015,1.483,1.483,0,0,1-.781-.831,1.525,1.525,0,0,1,.706-1.9l2.259-1.128a1.972,1.972,0,0,1,1.594-.094l4.639,1.828"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M8.2,20.606h1.6l3.049,2.326a.83.83,0,0,0,1.15.09l4.26-3.518a.842.842,0,0,0,.129-1.164l-2.347-2.609"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M13.736,13.506l-.247-.2a1.79,1.79,0,0,0-1.725-.22L8.194,14.6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M6.75,21.356h.3a1.141,1.141,0,0,0,1.2-1.071V14.927a1.141,1.141,0,0,0-1.2-1.071h-.3"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M23.25,21.356h-.3a1.141,1.141,0,0,1-1.2-1.071V14.927a1.141,1.141,0,0,1,1.2-1.071h.3"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Takeover Funding</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      {/* /////////////////////////////////////////////// */}
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">10</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 4, "Other");
                              }}
                              type="radio"
                              id="mco-af36a88d"
                              data-type="multiple-choice"
                              data-label="Entrepreneur Experience"
                              name="mc-7f337c89"
                              data-variable=""
                              value={payload[4].selected}
                              data-conditional="true"
                              data-answer="call me entrepreneur grandparent"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>help-question-network</title>
                                    <circle
                                      cx="3"
                                      cy="21"
                                      r="2.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <line
                                      x1="4.679"
                                      y1="19.502"
                                      x2="6.749"
                                      y2="18"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <circle
                                      cx="3"
                                      cy="3"
                                      r="2.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <line
                                      x1="4.679"
                                      y1="4.499"
                                      x2="6.749"
                                      y2="6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <circle
                                      cx="21"
                                      cy="21"
                                      r="2.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <line
                                      x1="19.322"
                                      y1="19.502"
                                      x2="17.252"
                                      y2="18"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <circle
                                      cx="21"
                                      cy="3"
                                      r="2.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <line
                                      x1="19.322"
                                      y1="4.499"
                                      x2="17.252"
                                      y2="6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M12,17.25a.375.375,0,1,1-.375.375A.375.375,0,0,1,12,17.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M9,9.75a3,3,0,1,1,4,2.829,1.5,1.5,0,0,0-1,1.415v.631"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Other</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      {/* /////////////////////////////////////////////// */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {page == 4 && (
          <div
            id="screen-58375ddb"
            name="funding-timeframe"
            data-type="user"
            className="undefined with-avatar"
            data-header="header"
            style={{ padding: "5%" }}
          >
            <div className="block" data-blocktype="rich-text">
              <div className="block-content text-block align-center inner-mid">
                <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                  <h2 style={{ color: "#fff" }}>
                    Where are you looking to invest?
                  </h2>
                </div>
              </div>
            </div>
            <div className="block" data-blocktype="multiple-choice">
              <div
                className="block-content multiple-choice-block inner-mid"
                data-align-siblings="false"
              >
                <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                  {/* //////////////////////////////////////////////////////// */}
                  <div className="multiple-choice mc-smart-flex picture">
                    <div className="multiple-choice-inner">
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">1</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(
                                  e,
                                  5,
                                  "Global Capital Allocation",
                                );
                              }}
                              type="radio"
                              id="mco-4e2d05e0"
                              data-type="multiple-choice"
                              data-label="Time Frame"
                              name="mc-2bcbcff1"
                              data-variable=""
                              value={payload[5].selected}
                              data-conditional="true"
                              data-answer="No idea"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>network-cash</title>
                                    <path
                                      d="M18.75,14.25H16.717a1.342,1.342,0,0,0-.5,2.588l2.064.825a1.342,1.342,0,0,1-.5,2.587H15.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="17.25"
                                      y1="14.25"
                                      x2="17.25"
                                      y2="13.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="17.25"
                                      y1="21"
                                      x2="17.25"
                                      y2="20.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <circle
                                      cx="17.25"
                                      cy="17.25"
                                      r="6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <path
                                      d="M11.232,23.224A11.25,11.25,0,1,1,23.145,10.455"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M9.289,22.921C7.768,20.689,6.75,16.633,6.75,12S7.768,3.312,9.289,1.079"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="0.775"
                                      y1="11.25"
                                      x2="10.298"
                                      y2="11.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="2.999"
                                      y1="5.25"
                                      x2="21"
                                      y2="5.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="2.048"
                                      y1="17.25"
                                      x2="8.25"
                                      y2="17.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M14.711,1.079a16.961,16.961,0,0,1,2.3,7.113"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">
                                  Global Capital Allocation
                                </div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">2</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 5, "Developed Markets");
                              }}
                              type="radio"
                              id="mco-69f2a128"
                              data-type="multiple-choice"
                              data-label="Time Frame"
                              name="mc-2bcbcff1"
                              data-variable=""
                              value={payload[5].selected}
                              data-conditional="true"
                              data-answer="6-12 months"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>business-deal-women-cash</title>
                                    <circle
                                      cx="6"
                                      cy="15.749"
                                      r="3"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <path
                                      d="M3,15.749S3,19.5.75,19.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M9,15.749s0,3.75,2.25,3.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M1.756,23.249a4.5,4.5,0,0,1,8.488,0"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M20.6,14.249A3,3,0,0,1,16.016,18"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M21,15.75s0,3.75,2.25,3.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M13.756,23.249a4.5,4.5,0,0,1,8.488,0"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M17.625,2.249H15a1.342,1.342,0,0,0-.5,2.588l2.655.825a1.342,1.342,0,0,1-.5,2.587H13.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="15.75"
                                      y1="2.249"
                                      x2="15.75"
                                      y2="0.749"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="15.75"
                                      y1="9.749"
                                      x2="15.75"
                                      y2="8.249"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M21,.749h.75a1.5,1.5,0,0,1,1.5,1.5V10.5a1.5,1.5,0,0,1-1.5,1.5h-4.5l-4.5,4.5V12h-3a1.5,1.5,0,0,1-1.5-1.5V2.249a1.5,1.5,0,0,1,1.5-1.5h1.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Developed Markets</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">3</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 5, "Emerging Markets");
                              }}
                              type="radio"
                              id="mco-f3d54741"
                              data-type="multiple-choice"
                              data-label="Time Frame"
                              name="mc-2bcbcff1"
                              data-variable=""
                              value={payload[5].selected}
                              data-conditional="true"
                              data-answer="HOIMA CITY"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>compass-east</title>
                                    <path
                                      d="M9.75,16.25H8.25a1.5,1.5,0,0,1-1.5-1.5v-4.5a1.5,1.5,0,0,1,1.5-1.5h1.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="6.75"
                                      y1="13.25"
                                      x2="9.75"
                                      y2="13.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <circle
                                      cx="8.25"
                                      cy="11.75"
                                      r="7.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <polyline
                                      points="13.719 16.882 23.25 11.75 13.719 6.618"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></polyline>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Emerging Markets</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">4</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 5, "Frontier Markets");
                              }}
                              type="radio"
                              id="mco-4e92bea2"
                              data-type="multiple-choice"
                              data-label="Time Frame"
                              name="mc-2bcbcff1"
                              data-variable=""
                              value={payload[5].selected}
                              data-conditional="true"
                              data-answer="Currently we don't need addtional funding"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>landmark-pyramid-sphinx</title>
                                    <path
                                      d="M18.563,14.163l1.674-1.656a1.719,1.719,0,0,0,.513-1.224V9.4a8.751,8.751,0,0,0-17.5,0v1.879a1.719,1.719,0,0,0,.513,1.224l1.674,1.656"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M20.75,19.5V18.058A4.155,4.155,0,0,0,19.512,15.1L14,9.649"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M10,9.649,4.488,15.1A4.155,4.155,0,0,0,3.25,18.058V19.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M15.5,4.212a3.5,3.5,0,0,0-7,0v2.6a3.5,3.5,0,0,0,7,0Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M8.5,23.25V21A1.5,1.5,0,0,0,7,19.5H3A1.5,1.5,0,0,0,1.5,21v2.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M15.5,23.25V21A1.5,1.5,0,0,1,17,19.5h4A1.5,1.5,0,0,1,22.5,21v2.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="9.608"
                                      y1="14.25"
                                      x2="14.158"
                                      y2="14.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="9.608"
                                      y1="17.25"
                                      x2="14.158"
                                      y2="17.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Frontier Markets</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">5</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(
                                  e,
                                  5,
                                  "Cross-Border Opportunities",
                                );
                              }}
                              type="radio"
                              id="mco-4e92bea2"
                              data-type="multiple-choice"
                              data-label="Time Frame"
                              name="mc-2bcbcff1"
                              data-variable=""
                              value={payload[5].selected}
                              data-conditional="true"
                              data-answer="Currently we don't need addtional funding"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>organic-tree</title>
                                    <path
                                      d="M22.934,22.561a3.712,3.712,0,0,0-4.759-2,7.486,7.486,0,0,0-12.349,0,3.712,3.712,0,0,0-4.759,2"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M9.751,14.969s.562-.47,1.125-12.283a1.125,1.125,0,0,1,2.25,0c.562,11.813,1.125,12.283,1.125,12.283"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <ellipse
                                      cx="19.684"
                                      cy="5.067"
                                      rx="4.957"
                                      ry="2.493"
                                      transform="translate(2.183 15.403) rotate(-45)"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></ellipse>
                                    <ellipse
                                      cx="4.317"
                                      cy="5.067"
                                      rx="2.493"
                                      ry="4.957"
                                      transform="translate(-2.318 4.537) rotate(-45)"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></ellipse>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">
                                  Cross-Border Opportunities
                                </div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>{" "}
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">6</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(
                                  e,
                                  5,
                                  "Sector-Driven Opportunities",
                                );
                              }}
                              type="radio"
                              id="mco-4e92bea2"
                              data-type="multiple-choice"
                              data-label="Time Frame"
                              name="mc-2bcbcff1"
                              data-variable=""
                              value={payload[5].selected}
                              data-conditional="true"
                              data-answer="Currently we don't need addtional funding"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>landmark-mesoamerican-pyramid</title>
                                    <line
                                      x1="16.5"
                                      y1="3"
                                      x2="16.5"
                                      y2="9"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="7.5"
                                      y1="9"
                                      x2="7.5"
                                      y2="3"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="6"
                                      y1="3"
                                      x2="18"
                                      y2="3"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M5,9H7.5a0,0,0,0,1,0,0v3a0,0,0,0,1,0,0h-3a0,0,0,0,1,0,0V9.5A.5.5,0,0,1,5,9Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M3.5,12h4a0,0,0,0,1,0,0v4.5a0,0,0,0,1,0,0H3a0,0,0,0,1,0,0v-4A.5.5,0,0,1,3.5,12Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M1.25,16.5H7.5a0,0,0,0,1,0,0V21a0,0,0,0,1,0,0H.75a0,0,0,0,1,0,0V17A.5.5,0,0,1,1.25,16.5Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M16.5,9h3a0,0,0,0,1,0,0v3a0,0,0,0,1,0,0H17a.5.5,0,0,1-.5-.5V9A0,0,0,0,1,16.5,9Z"
                                      transform="translate(36 21) rotate(-180)"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M16.5,12H21a0,0,0,0,1,0,0v4.5a0,0,0,0,1,0,0H17a.5.5,0,0,1-.5-.5V12A0,0,0,0,1,16.5,12Z"
                                      transform="translate(37.5 28.5) rotate(-180)"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M16.5,16.5h6.75a0,0,0,0,1,0,0V21a0,0,0,0,1,0,0H17a.5.5,0,0,1-.5-.5v-4A0,0,0,0,1,16.5,16.5Z"
                                      transform="translate(39.75 37.5) rotate(-180)"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M7.5,9h3V7.5a1.5,1.5,0,0,1,3,0V9h3"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="10.5"
                                      y1="12"
                                      x2="13.5"
                                      y2="12"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="10.5"
                                      y1="15"
                                      x2="13.5"
                                      y2="15"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="10.5"
                                      y1="18"
                                      x2="13.5"
                                      y2="18"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="10.5"
                                      y1="21"
                                      x2="13.5"
                                      y2="21"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">
                                  Sector-Driven Opportunities
                                </div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">7</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 5, "Deal-Specific Mandates");
                              }}
                              type="radio"
                              id="mco-4e92bea2"
                              data-type="multiple-choice"
                              data-label="Time Frame"
                              name="mc-2bcbcff1"
                              data-variable=""
                              value={payload[5].selected}
                              data-conditional="true"
                              data-answer="Currently we don't need addtional funding"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>landmark-statue-of-liberty</title>
                                    <path
                                      d="M5,4.75a2,2,0,0,1-4,0c0-1.1,2-4,2-4S5,3.645,5,4.75Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M21,23.25H16.5l1.216-4.864a1.5,1.5,0,0,1,1.455-1.136h2.158a1.5,1.5,0,0,1,1.455,1.864L22.5,20.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="6.75"
                                      y1="14.25"
                                      x2="4.65"
                                      y2="9"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="1.5"
                                      y1="9"
                                      x2="5.092"
                                      y2="17.98"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M9.31,16.811,6.75,14.25,4.235,19.908a1.5,1.5,0,0,0,.471,1.809L6.75,23.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="15.761"
                                      y1="16.531"
                                      x2="11.562"
                                      y2="23.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M15.78,8.573A1.5,1.5,0,0,1,16.812,10V14.25a3,3,0,0,1-6,0V10a1.5,1.5,0,0,1,1.032-1.425A6.152,6.152,0,0,1,15.78,8.573Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M10.812,12a6.375,6.375,0,0,1,6,0"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="13.812"
                                      y1="5.25"
                                      x2="13.812"
                                      y2="8.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="10.062"
                                      y1="6.566"
                                      x2="11.71"
                                      y2="8.624"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="8.25"
                                      y1="9"
                                      x2="10.812"
                                      y2="10.036"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="17.562"
                                      y1="6.566"
                                      x2="15.915"
                                      y2="8.624"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="19.374"
                                      y1="9"
                                      x2="16.825"
                                      y2="10.031"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M20.75,20.25h2.5a0,0,0,0,1,0,0v3a0,0,0,0,1,0,0h-2.5a.5.5,0,0,1-.5-.5v-2A.5.5,0,0,1,20.75,20.25Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="0.75"
                                      y1="9"
                                      x2="6"
                                      y2="9"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">
                                  Deal-Specific Mandates
                                </div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>{" "}
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">8</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(
                                  e,
                                  5,
                                  "Custom Allocation Preference",
                                );
                              }}
                              type="radio"
                              id="mco-4e92bea2"
                              data-type="multiple-choice"
                              data-label="Time Frame"
                              name="mc-2bcbcff1"
                              data-variable=""
                              value={payload[5].selected}
                              data-conditional="true"
                              data-answer="Currently we don't need addtional funding"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>landmark-chinese-wall</title>
                                    <rect
                                      x="14.25"
                                      y="8.25"
                                      width="9"
                                      height="9"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></rect>
                                    <path
                                      d="M20.25,17.25h-3V13.5a1.5,1.5,0,0,1,3,0Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="14.25"
                                      y1="8.25"
                                      x2="14.25"
                                      y2="6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="18.75"
                                      y1="8.25"
                                      x2="18.75"
                                      y2="6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="23.25"
                                      y1="8.25"
                                      x2="23.25"
                                      y2="6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <polyline
                                      points="0.75 9 0.75 3 6.75 3 6.75 9.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></polyline>
                                    <line
                                      x1="0.75"
                                      y1="3"
                                      x2="0.75"
                                      y2="0.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="3.75"
                                      y1="3"
                                      x2="3.75"
                                      y2="0.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="6.75"
                                      y1="3"
                                      x2="6.75"
                                      y2="0.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M10.25,16,1.579,11.665A1.5,1.5,0,0,1,.75,10.323V6.75l9.9,4.95"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="8.25"
                                      y1="23.25"
                                      x2="14.25"
                                      y2="17.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="3.75"
                                      y1="22.5"
                                      x2="14.25"
                                      y2="12"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="23.25"
                                      y1="17.25"
                                      x2="18.75"
                                      y2="23.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">
                                  Custom Allocation Preference
                                </div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {page == 5 && (
          <div
            id="screen-58375ddb"
            name="funding-timeframe"
            data-type="user"
            className="undefined with-avatar"
            data-header="header"
            style={{ padding: "5%" }}
          >
            <div className="block" data-blocktype="rich-text">
              <div className="block-content text-block align-center inner-mid">
                <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                  <h2 style={{ color: "#fff" }}>
                    Are you comfortable to be the lead investor?
                  </h2>
                </div>
              </div>
            </div>
            <div className="block" data-blocktype="multiple-choice">
              <div
                className="block-content multiple-choice-block inner-mid"
                data-align-siblings="false"
              >
                <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                  {/* //////////////////////////////////////////////////////// */}
                  <div className="multiple-choice mc-smart-flex picture">
                    <div className="multiple-choice-inner">
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">1</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 6, "Yes!");
                              }}
                              type="radio"
                              id="mco-4e2d05e0"
                              data-type="multiple-choice"
                              data-label="Time Frame"
                              name="mc-2bcbcff1"
                              data-variable=""
                              value={payload[6].selected}
                              data-conditional="true"
                              data-answer="No idea"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>cash-user-man-message</title>
                                    <path
                                      d="M12.75,15.75h1.5v4.5l4.5-4.5h3a1.5,1.5,0,0,0,1.5-1.5v-12a1.5,1.5,0,0,0-1.5-1.5h-12a1.5,1.5,0,0,0-1.5,1.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M17.625,5.091H15a1.342,1.342,0,0,0-.5,2.588l2.655.825a1.342,1.342,0,0,1-.5,2.587H13.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="15.75"
                                      y1="5.091"
                                      x2="15.75"
                                      y2="3.591"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <line
                                      x1="15.75"
                                      y1="12.591"
                                      x2="15.75"
                                      y2="11.091"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <circle
                                      cx="5.25"
                                      cy="7.5"
                                      r="3"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <line
                                      x1="5.25"
                                      y1="12"
                                      x2="5.25"
                                      y2="18"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <path
                                      d="M7.875,23.25,8.25,19.5h1.5v-3a4.5,4.5,0,0,0-9,0v3h1.5l.375,3.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Yes!</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">2</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 6, "Maybe");
                              }}
                              type="radio"
                              id="mco-69f2a128"
                              data-type="multiple-choice"
                              data-label="Time Frame"
                              name="mc-2bcbcff1"
                              data-variable=""
                              value={payload[6].selected}
                              data-conditional="true"
                              data-answer="6-12 months"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>business-team-goal</title>
                                    <path
                                      d="M20.651,23.25a6.73,6.73,0,0,0-6.337-4.5h-.006a6.729,6.729,0,0,0-6.336,4.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M10.754,11.031A6.857,6.857,0,0,0,18.4,12.567"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <circle
                                      cx="14.308"
                                      cy="13.125"
                                      r="4.125"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <circle
                                      cx="4.975"
                                      cy="15.75"
                                      r="3"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></circle>
                                    <path
                                      d="M5.864,20.338A4.482,4.482,0,0,0,.75,23.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="14.311"
                                      y1="18.75"
                                      x2="14.311"
                                      y2="23.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></line>
                                    <polyline
                                      points="23.25 23.25 23.25 0.75 10.5 0.75 13.5 3.75 10.5 6.75 23.25 6.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></polyline>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Maybe</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>

                      <div className="multiple-choice-option-container">
                        <div
                          className="multiple-choice-option"
                          hey-nextscreen=""
                          hey-important=""
                          hey-autoredirect="true"
                        >
                          <label>
                            <div className="option-counter">3</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(e, 6, "No");
                              }}
                              type="radio"
                              id="mco-69f2a128"
                              data-type="multiple-choice"
                              data-label="Time Frame"
                              name="mc-2bcbcff1"
                              data-variable=""
                              value={payload[6].selected}
                              data-conditional="true"
                              data-answer="6-12 months"
                              data-destination="next"
                              data-priority="0"
                            />
                            <div className="option-content picture">
                              <div className="selector-container radio-selector">
                                <span className="radio"></span>
                              </div>
                              <div className="image-container">
                                <div className="svg-container">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <defs></defs>
                                    <title>disable</title>
                                    <path
                                      d="M19.968,4.067c-.006-.007-.007-.015-.014-.022s-.015-.008-.021-.014A11.244,11.244,0,0,0,4.024,19.924c.009.009.012.022.021.031s.021.011.031.02A11.243,11.243,0,0,0,19.968,4.067ZM12,4.5a7.444,7.444,0,0,1,3.8,1.046L5.547,15.8A7.484,7.484,0,0,1,12,4.5Zm0,15a7.45,7.45,0,0,1-3.8-1.047L18.454,8.2A7.486,7.486,0,0,1,12,19.5Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">No</div>
                              </div>
                            </div>
                            <div></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {page == 6 && (
          <div
            id="screen-9f314710"
            name="sign-up-form"
            data-type="user"
            className="undefined with-avatar"
            data-header="header"
            style={{ padding: "5%" }}
          >
            <div className="block" data-blocktype="rich-text">
              <div className="block-content text-block align-center inner-mid">
                <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                  <h2 style={{ color: "#fff" }}>
                    Are you looking at specific industries, technologies and
                    market?
                  </h2>
                </div>
              </div>
            </div>
            {/* /////////////////////////////////////////////// */}
            <div className="block" data-blocktype="elements">
              <div className="block-content elements-container elements-v1-container flex-box inner-full bg-unset border-unset br-unset container-style-1">
                <div
                  className="elements-container-inner inner-narrow"
                  id={"signup-block-styles"}
                  style={{ margin: "auto" }}
                >
                  <div key="123123123">
                    <div className="block" data-blocktype="elements">
                      <div className="block-content elements-container elements-v1-container flex-box inner-full bg-unset border-unset br-unset">
                        <div
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "row",
                            margin: "auto",
                            paddingTop: 5,
                            paddingBottom: 5,
                          }}
                          className="elements-container-inner inner-full"
                        >
                          <div className="block" data-blocktype="input">
                            <div
                              className="block-content input-box inner-narrow show-error-on-nav with-floating-label floating-label-inline"
                              id="input-fbd2a849-container"
                            >
                              <div>
                                <div className="input">
                                  <div style={{ display: "flex" }}>
                                    <div
                                      style={{
                                        flex: 1,
                                        position: "relative",
                                      }}
                                    >
                                      <input
                                        // id="input-fbd2a849"
                                        type="text"
                                        onChange={(e) => {
                                          // console.log(e.target.value)
                                          handleOnInputChange(
                                            e.target.value,
                                            7,
                                          );
                                        }}
                                      />
                                      <div className="input-floating-label">
                                        <span>
                                          Yes,I am looking for following
                                          industries (e.g fintech)
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* //////////////////////////////////////////////////////////////////////////////////////////// */}
                    <div className="block" data-blocktype="elements">
                      <div className="block-content elements-container elements-v1-container flex-box inner-full bg-unset border-unset br-unset">
                        <div
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "row",
                            margin: "auto",
                            paddingTop: 5,
                            paddingBottom: 5,
                          }}
                          className="elements-container-inner inner-full"
                        >
                          <div className="block" data-blocktype="input">
                            <div
                              className="block-content input-box inner-narrow show-error-on-nav with-floating-label floating-label-inline"
                              id="input-fbd2a849-container"
                            >
                              <div>
                                <div className="input">
                                  <div style={{ display: "flex" }}>
                                    <div
                                      style={{
                                        flex: 1,
                                        position: "relative",
                                      }}
                                    >
                                      <input
                                        // id="input-fbd2a849"
                                        type="text"
                                        onChange={(e) => {
                                          // console.log(e.target.value)
                                          handleOnInputChange(
                                            e.target.value,
                                            8,
                                          );
                                        }}
                                      />
                                      <div className="input-floating-label">
                                        <span>Business Model (e.g B2B)</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* //////////////////////////////////////////////////////////////////////////////////////////// */}
                    {/* //////////////////////////////////////////////////////////////////////////////////////////// */}
                    <div className="block" data-blocktype="elements">
                      <div className="block-content elements-container elements-v1-container flex-box inner-full bg-unset border-unset br-unset">
                        <div
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "row",
                            margin: "auto",
                            paddingTop: 5,
                            paddingBottom: 5,
                          }}
                          className="elements-container-inner inner-full"
                        >
                          <div className="block" data-blocktype="input">
                            <div
                              className="block-content input-box inner-narrow show-error-on-nav with-floating-label floating-label-inline"
                              id="input-fbd2a849-container"
                            >
                              <div>
                                <div className="input">
                                  <div style={{ display: "flex" }}>
                                    <div
                                      style={{
                                        flex: 1,
                                        position: "relative",
                                      }}
                                    >
                                      <input
                                        // id="input-fbd2a849"
                                        type="text"
                                        onChange={(e) => {
                                          // console.log(e.target.value)
                                          handleOnInputChange(
                                            e.target.value,
                                            9,
                                          );
                                        }}
                                      />
                                      <div className="input-floating-label">
                                        <span>
                                          Partner investors reference code
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* //////////////////////////////////////////////////////////////////////////////////////////// */}

                    <div className="block" data-blocktype="generic-button">
                      <div className="block-content generic-button-block inner-narrow">
                        <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setPage(page + 1);
                            }}
                            className="generic-button continue medium"
                          >
                            <div className="content align-center">
                              <div className="label-container">
                                <span className="label">
                                  <font style={{ verticalAlign: "inherit" }}>
                                    <font style={{ verticalAlign: "inherit" }}>
                                      Next
                                    </font>
                                  </font>
                                </span>
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {page == 7 && (
          <div
            id="screen-9f314710"
            name="sign-up-form"
            data-type="user"
            className="undefined with-avatar"
            data-header="header"
            style={{ padding: "5%" }}
          >
            <div className="block" data-blocktype="rich-text">
              <div className="block-content text-block align-center inner-mid">
                {otpState ? (
                  <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                    <h2
                      style={{ marginTop: 20, marginBottom: 20, color: "#fff" }}
                    >
                      Welcome to Mk Timothy, a self-service AI-powered platform.
                      Here, investors are auto-vetted and matched with virgin
                      business areas for investment
                    </h2>
                    <h3 style={{ color: "#fff" }}>
                      Enter the six digits sent to your registered phone to
                      verify your identity.
                    </h3>

                    {/*<span className="text-[#ec3b37]"> {otpState ? userInfo.phone : ''}</span>*/}
                  </div>
                ) : (
                  <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                    <h2 style={{ color: "#fff" }}>Private Investor Access</h2>
                    <h3 style={{ color: "#fff" }}>
                      Selective access for qualified investors seeking
                      private-market opportunities.
                    </h3>
                    <p
                      style={{
                        color: "#fff",
                        marginTop: 10,
                        fontStyle: "italic",
                      }}
                    >
                      Discreet. Curated. Global.
                    </p>
                    {/*<span className="text-[#ec3b37]"> {otpState ? userInfo.phone : ''}</span>*/}
                  </div>
                )}
              </div>
            </div>
            <div className="block" data-blocktype="elements">
              <div className="block-content elements-container elements-v1-container flex-box inner-full bg-unset border-unset br-unset container-style-1">
                <div
                  className="elements-container-inner inner-narrow"
                  id={"signup-block-styles"}
                  style={{ margin: "auto" }}
                >
                  <div className="block" data-blocktype="multiple-choice">
                    <div
                      className="block-content multiple-choice-block inner-narrow"
                      data-align-siblings=""
                    >
                      <div style={{ paddingBottom: 5 }}></div>
                    </div>
                  </div>
                  {!otpState ? (
                    <div key="123123123">
                      <div className="block" data-blocktype="elements">
                        <div className="block-content elements-container elements-v1-container flex-box inner-full bg-unset border-unset br-unset">
                          <div
                            style={{
                              justifyContent: "center",
                              alignItems: "center",
                              flexDirection: "row",
                              margin: "auto",
                              paddingTop: 5,
                              paddingBottom: 5,
                            }}
                            className="elements-container-inner inner-full"
                          >
                            <div className="block" data-blocktype="input">
                              <div
                                className="block-content input-box inner-narrow show-error-on-nav with-floating-label floating-label-inline"
                                id="input-fbd2a849-container"
                              >
                                <div>
                                  <label htmlFor="input-fbd2a849">
                                    Full Name
                                  </label>
                                  <div className="input">
                                    <div style={{ display: "flex" }}>
                                      <div
                                        style={{
                                          flex: 1,
                                          position: "relative",
                                        }}
                                      >
                                        <input
                                          // id="input-fbd2a849"
                                          type="text"
                                          data-label="Full Name"
                                          name="name"
                                          value={userInfo.name}
                                          onChange={(e) => {
                                            handleSignupFormChange(e);
                                          }}
                                          autoComplete="off"
                                          className=""
                                        />
                                        <div className="input-floating-label">
                                          <span>Full Name</span>
                                        </div>
                                      </div>
                                    </div>

                                    {formErrors.name && (
                                      <div
                                        style={{
                                          color: "red",
                                          margin: "10px 0",
                                        }}
                                      >
                                        <span className="text">
                                          Please enter your name
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="block" data-blocktype="input">
                        <div
                          className="block-content input-box inner-narrow show-error-on-nav with-floating-label floating-label-inline"
                          id="input-e32f95a6-container"
                        >
                          <div style={{ paddingTop: 5, paddingBottom: 5 }}>
                            <label htmlFor="input-e32f95a6">
                              Professional Email
                            </label>
                            <div className="input has-prefix">
                              <div style={{ display: "flex" }}>
                                <div style={{ flex: 1, position: "relative" }}>
                                  <input
                                    onChange={(e) => {
                                      handleSignupFormChange(e);
                                    }}
                                    id="input-e32f95a6"
                                    value={userInfo.email}
                                    type="email"
                                    name="email"
                                    data-type="input"
                                    data-label="Professional Email"
                                    data-sensitive=""
                                    data-variable=""
                                    data-mask=""
                                    placeholder="address@mail.com"
                                    pattern="^\S+@\S+\.\S+$"
                                    maxLength=""
                                    required="required"
                                    autoComplete="email"
                                    className=""
                                  />
                                  <div className="input-floating-label">
                                    <span>Professional Email</span>
                                  </div>
                                </div>
                              </div>
                              {formErrors.email && (
                                <div style={{ color: "red", margin: "10px 0" }}>
                                  <span className="text">
                                    Please enter a valid email address
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="block" data-blocktype="input">
                        <div
                          className="block-content input-box inner-narrow show-error-on-nav with-floating-label floating-label-inline"
                          style={{ paddingTop: 5, paddingBottom: 5 }}
                        >
                          <label
                            style={{
                              color: "#fff",
                              marginBottom: 5,
                              display: "block",
                            }}
                          >
                            Direct Number
                          </label>
                          <PhoneInput
                            country={"us"}
                            value={userInfo.phone}
                            inputClass="!pl-[50px]"
                            inputStyle={{ background: "red !important" }}
                            name="phone"
                            onChange={(phone) =>
                              setUserInfo({ ...userInfo, phone: phone })
                            }
                          />
                        </div>
                        {formErrors.phone && (
                          <div style={{ color: "red", margin: "10px 0" }}>
                            <span className="text">
                              Please enter a valid phone number
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="block" data-blocktype="simple-checkbox">
                        <div className="block-content simple-checkbox inner-narrow">
                          <div style={{ paddingTop: 10, paddingBottom: 10 }}>
                            <label htmlFor="checkbox-0014d968">
                              <input
                                type="checkbox"
                                hey-type="simple-checkbox"
                                data-type="simple-checkbox"
                                id="checkbox-0014d968"
                                name="checkbox-0014d968"
                                data-label="Accredited Investor Confirmation"
                                data-answer="✔"
                                value="✔"
                                checked={accreditedInvestor}
                                onChange={(e) => {
                                  setAccreditedInvestor(e.target.checked);
                                  if (e.target.checked) {
                                    setFormErrors({
                                      ...formErrors,
                                      accreditedInvestor: false,
                                    });
                                  }
                                }}
                                required="required"
                              />
                              <div
                                className="simple-checkbox-content"
                                style={{ display: "flex" }}
                              >
                                <span className="checkbox">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="192"
                                    height="192"
                                    fill="currentColor"
                                    viewBox="0 0 256 256"
                                  >
                                    <rect
                                      width="256"
                                      height="256"
                                      fill="none"
                                    ></rect>
                                    <polyline
                                      points="216 72.005 104 184 48 128.005"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="24"
                                    ></polyline>
                                  </svg>
                                </span>
                                <div
                                  style={{ color: "#fff" }}
                                  className="label-container"
                                >
                                  <span
                                    style={{ color: "#fff" }}
                                    className="simple-checkbox-text"
                                  >
                                    I confirm I am a professional or accredited
                                    investor.
                                  </span>
                                </div>
                              </div>
                            </label>
                            {formErrors.accreditedInvestor && (
                              <div style={{ color: "red", margin: "10px 0" }}>
                                <span className="text">
                                  Please confirm you are a professional or
                                  accredited investor
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="block " data-blocktype="generic-button">
                        <div className="block-content generic-button-block inner-narrow">
                          <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                            {showCaptcha && (
                              <div
                                style={{ paddingBottom: 15 }}
                                id="recaptcha-container"
                              ></div>
                            )}

                            {otpError.error && (
                              <div style={{ color: "red", margin: "10px 0" }}>
                                <span className="text">{otpError.message}</span>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                submit();
                              }}
                              className="generic-button continue medium"
                            >
                              <div className="content align-center">
                                <div className="label-container">
                                  <span className="label">
                                    <font style={{ verticalAlign: "inherit" }}>
                                      <font
                                        style={{ verticalAlign: "inherit" }}
                                      >
                                        {" "}
                                        {buttonDisabled === true
                                          ? "Processing"
                                          : "Request Access"}
                                      </font>
                                    </font>
                                  </span>
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key="9898947594">
                      <div className="block" data-blocktype="input">
                        <ReactCodeInput
                          type="number"
                          fields={6}
                          onChange={(e) => setotp(e)}
                          inputStyle={{
                            width: "50px",

                            height: "60px",
                            border: "1px solid #d4d6d5",
                            borderRadius: "8px",
                            outline: "none",
                            padding: "0px 10px",
                            fontSize: "20px",
                            textAlign: "center",
                            margin: "0px 5px",
                          }}
                        />

                        <div
                          className={`error-box-phone ${
                            formErrors.phone ? "display-error" : ""
                          }`}
                        >
                          <span className="text">
                            Please enter a valid phone number
                          </span>
                        </div>
                      </div>
                      <div className="block" data-blocktype="generic-button">
                        <div className="block-content generic-button-block inner-narrow">
                          <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                            <button
                              type="button"
                              onClick={() => {
                                verifyOtp();
                              }}
                              className="generic-button continue medium"
                            >
                              <div className="content align-center">
                                <div className="label-container">
                                  <span className="label">
                                    <font style={{ verticalAlign: "inherit" }}>
                                      <font
                                        style={{ verticalAlign: "inherit" }}
                                      >
                                        {verifyButtonDisabled === true
                                          ? "Please wait..."
                                          : "Verify"}
                                      </font>
                                    </font>
                                  </span>
                                </div>
                              </div>
                            </button>

                            <div
                              className="block"
                              data-blocktype="generic-button"
                            >
                              <div className="block-content generic-button-block inner-narrow">
                                <div
                                  style={{ paddingTop: 20, paddingBottom: 20 }}
                                >
                                  {otpError.error && (
                                    <div
                                      className={`error-box-phone display-error `}
                                    >
                                      <span className="text">
                                        {otpError.message}
                                      </span>
                                    </div>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      submit();
                                    }}
                                    className="generic-button continue medium"
                                  >
                                    <div className="content align-center">
                                      <div className="label-container">
                                        <span className="label">
                                          <font
                                            style={{ verticalAlign: "inherit" }}
                                          >
                                            <font
                                              style={{
                                                verticalAlign: "inherit",
                                              }}
                                            >
                                              Resend OTP
                                            </font>
                                          </font>
                                        </span>
                                      </div>
                                    </div>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {page == 8 && (
          <div
            id="screen-5df6708d"
            name="thank-you"
            data-type="user"
            className="undefined with-avatar"
            data-header="header"
            style={{ padding: "5%" }}
          >
            <div className="block" data-blocktype="rich-text">
              <div className="block-content text-block align-center inner-mid">
                <div style={{ paddingTop: 20, paddingBottom: 0 }}>
                  <h2 style={{ color: "#fff" }}>
                    Congratulations! Your interest to invest in Uganda has well
                    been received.
                  </h2>
                  <h2>
                    <br />
                  </h2>
                </div>
              </div>
            </div>

            <div className="mx-auto w-fit" data-blocktype="generic-button">
              <div className="block-content generic-button-block inner-narrow">
                <div style={{ paddingTop: 2, paddingBottom: 2 }}>
                  <button
                    id="id-208bf28c"
                    className="generic-button link large align-center"
                    onClick={() => {
                      window.location.href = "/";
                    }}
                  >
                    <div className="content align-space-between reverse w-fit">
                      <div className="label-container">
                        <span style={{ background: "linear-gradient(45deg, #00A372, #00805A, #006648)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }} className="label">
                          Click here to learn more about Uganda.
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <div className="block" data-blocktype="rich-text">
              <div className="block-content text-block align-center inner-mid">
                <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                  <p style={{ color: "#fff" }}>
                    Please check your email, and click on the link provided to
                    schedule a meeting with Mk Timothy. Remember to review all
                    the folders, including{" "}
                    <span style={{ background: "linear-gradient(45deg, #00A372, #00805A, #006648)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }} >Spam</span>, and marking it
                    not <span style={{ background: "linear-gradient(45deg, #00A372, #00805A, #006648)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }} >Spam</span>.
                  </p>
                </div>
              </div>
            </div>
            <div className="mx-auto w-fit mb-2" data-blocktype="generic-button">
              <div className="block-content generic-button-block inner-narrow">
                <div style={{ paddingTop: 2, paddingBottom: 2 }}>
                  <button
                    id="id-208bf28c"
                    className="generic-button link large align-center"
                    onClick={() => {
                      window.location.href =
                        "http://www.linkedin.com/company/mktimothy";
                    }}
                  >
                    <div className="content align-space-between reverse w-fit">
                      <div className="label-container">
                        <span style={{ background: "linear-gradient(45deg, #00A372, #00805A, #006648)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }} className="label">
                          LinkedIn
                        </span>
                      </div>
                      <span className="graphic">
                        <svg
                          style={{ color: "#00A372" }}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <defs></defs>
                          <title>professional-network-linkedin</title>
                          <path
                            d="M5.67,22.63H.81V8.7H5.67Zm10.09-9.39a2.14,2.14,0,0,0-2.14,2.14v7.25H8.51V8.7h5.11v1.59a6.76,6.76,0,0,1,4.28-1.6c3.17,0,5.37,2.35,5.37,6.81v7.13H17.9V15.38A2.14,2.14,0,0,0,15.76,13.23Zm-10-9.36a2.5,2.5,0,1,1-2.5-2.5A2.5,2.5,0,0,1,5.74,3.88Z"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5px"
                          ></path>
                        </svg>
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <div className="mx-auto w-fit mb-2" data-blocktype="generic-button">
              <div className="block-content generic-button-block inner-narrow">
                <div style={{ paddingTop: 2, paddingBottom: 2 }}>
                  <button
                    id="id-1d668be0"
                    className="generic-button link large align-center"
                    onClick={() => {
                      window.location.href = "https://twitter.com/Mk Timothy_";
                    }}
                  >
                    <div className="content align-space-between reverse">
                      <div className="label-container">
                        <span style={{ background: "linear-gradient(45deg, #00A372, #00805A, #006648)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }} className="label">
                          Twitter
                        </span>
                      </div>
                      <span className="graphic">
                        <svg
                          style={{ color: "#00A372" }}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <defs></defs>
                          <title>social-media-twitter</title>
                          <path
                            d="M23.18,6.71l-2.1-.9,1.1-2.4-2.56.85a4.47,4.47,0,0,0-3-1.2,4.51,4.51,0,0,0-4.5,4.5v1c-3.54.73-6.63-1.2-9.5-4.5q-.75,4,1.5,6L.83,9.56a4.55,4.55,0,0,0,4.25,4l-2.75,1c1,2,2.82,2.31,5.25,2.5a11.52,11.52,0,0,1-6.75,2c12.76,5.67,20.25-2.66,20.25-10V8.23Z"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5px"
                          ></path>
                        </svg>
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <div className="mx-auto w-fit mb-2" data-blocktype="generic-button">
              <div className="block-content generic-button-block inner-narrow">
                <div style={{ paddingTop: 2, paddingBottom: 2 }}>
                  <button
                    id="id-d446848e"
                    className="generic-button link large align-center"
                    onClick={() => {
                      window.location.href =
                        "https://www.facebook.com/mktimothyexpanding";
                    }}
                  >
                    <div className="content align-space-between reverse">
                      <div className="label-container">
                        <span style={{ background: "linear-gradient(45deg, #00A372, #00805A, #006648)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }} className="label">
                          Facebook
                        </span>
                      </div>
                      <span className="graphic">
                        <svg
                          style={{ color: "#00A372" }}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <defs></defs>
                          <title>social-media-facebook</title>
                          <path
                            d="M18.13,7.75H13.87V5.84a1,1,0,0,1,1-1.1h3v-4H13.54c-3.93,0-4.67,3-4.67,4.86V7.75h-3v4h3v11.5h5V11.75h3.85Z"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5px"
                          ></path>
                        </svg>
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <div className="mx-auto w-fit" data-blocktype="generic-button">
              <div className="block-content generic-button-block inner-narrow">
                <div style={{ paddingTop: 2, paddingBottom: 2 }}>
                  <button
                    id="id-a3ba67af"
                    className="generic-button link large align-center"
                    onClick={() => {
                      window.location.href = "mailto:info@mktimothy.com";
                    }}
                  >
                    <div className="content align-space-between reverse">
                      <div className="label-container">
                        <span style={{ background: "linear-gradient(45deg, #00A372, #00805A, #006648)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }} className="label">
                          via Email
                        </span>
                      </div>
                      <span className="graphic">
                        <svg
                          style={{ color: "#00A372" }}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <defs></defs>
                          <title>send-email-envelope</title>
                          <path
                            d="M21.23,16.776A1.5,1.5,0,0,1,19.755,18H2.558a1.5,1.5,0,0,1-1.475-1.776l1.688-9A1.5,1.5,0,0,1,4.245,6h17.2a1.5,1.5,0,0,1,1.474,1.776Z"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5px"
                          ></path>
                          <polyline
                            points="22.917 7.776 12 12 2.771 7.224"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5px"
                          ></polyline>
                        </svg>
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Form;
