"use client";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReactCodeInput from "react-code-input";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Layout from "./Layout";

const Form = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [verifyButtonDisabled, setVerifyButtonDisabled] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    phone: false,
    agreeToTerms: false,
  });

  useEffect(() => {
    if (searchParams.get("direct")) {
      setPage(5);
    }
  }, [searchParams]);

  // console.log(formErrors)adasdas
  const [payload, setPayload] = useState([
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
      question: "How Much Time Do You Think You Need For Your Next Funding?",
      number: 5,
      selected: "",
      answer: "",
    },
  ]);

  // console.log(payload)
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
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
  // console.log(otpError) sadsads

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
      agreeToTerms: !agreeToTerms,
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
      .post("/api/pitch-idea/send-otp", {
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
      .post("/api/pitch-idea/verify-otp", {
        phone: userInfo.phone,
        otp: otp,
      })
      .then((result) => {
        // handleSubmit(formData);
        sendEmail();

        // db.collection("loans_applications_verified_phone")
        //   .add({
        //     phone: userInfo.phone,
        //   })
        //   .then(() => {
        //     console.log("success");
        //     sendEmail();
        //   });
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
      .post("/api/pitch-idea/question", body)
      .then(async (response) => {
        await axios.post("/api/pitch-idea/email", body);
        setUserInfo({
          name: "",
          email: "",
          phone: "",
          gender: "",
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

  ////////////////////////////

  useEffect(() => {
    if (page == 6) {
      setTimeout(() => {
        Router.push({
          pathname: "https://www.mktimothy.com/",
        });
      }, 30000);
    }
  }, [page]);

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
                  <h2>Here is a Few Questions to Guide You Through&nbsp;</h2>
                  <h3>
                    <br />
                  </h3>
                  <h3>At what level is your business right now?</h3>
                </div>
              </div>
            </div>
            <div className="block" data-blocktype="multiple-choice">
              <div
                className="block-content multiple-choice-block inner-mid"
                data-align-siblings="false"
              >
                <div style={{ paddingTop: 20, paddingBottom: 20 }}>
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
                                handleOnChange(e, 1, "We have an idea");
                              }}
                              type="radio"
                              id="mco-cacf406e"
                              data-type="multiple-choice"
                              data-label="Startup Stage"
                              name="mc-7104fe52"
                              data-variable=""
                              value={payload[0].selected}
                              data-conditional="true"
                              data-answer="We have an idea"
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
                                    <path
                                      d="M16.828,13.555l6.456-9.822A1.16,1.16,0,0,0,21.4,2.385l-7.26,9.374"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M8.7,15.62c-2.294-.547-4.4-1.614-4.99-3.587A1.8,1.8,0,0,0,2,10.749a1.494,1.494,0,0,0-1.481,1.7A11.191,11.191,0,0,0,9.59,22.028a3.142,3.142,0,0,0,3.2-1.2"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M9.359,17.713a.59.59,0,0,0,.067,1.109c3.932,1.131,6.965-1.417,7.514-3.382a2.9,2.9,0,0,0-5.587-1.56C10.848,15.688,11.09,16.979,9.359,17.713Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">We have an idea</div>
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
                                handleOnChange(
                                  e,
                                  1,
                                  "We Are building our first product",
                                );
                              }}
                              type="radio"
                              id="mco-5ed5b7c5"
                              data-type="multiple-choice"
                              data-label="Startup Stage"
                              name="mc-7104fe52"
                              data-variable=""
                              value={payload[0].selected}
                              data-conditional="true"
                              data-answer="We Are building our first product  "
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
                                    <title>website-build</title>
                                    <path
                                      d="M23,12a.5.5,0,0,1,.5.5V20a2,2,0,0,1-2,2H2.5a2,2,0,0,1-2-2V4a2,2,0,0,1,2-2H13a.5.5,0,0,1,.5.5V11a1,1,0,0,0,1,1Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="0.5"
                                      y1="7"
                                      x2="13.5"
                                      y2="7"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5px"
                                      strokeMiterlimit="10"
                                    ></line>
                                    <path
                                      d="M4,4.25a.25.25,0,1,1-.25.25A.25.25,0,0,1,4,4.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M7,4.25a.25.25,0,1,1-.25.25A.25.25,0,0,1,7,4.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M10,4.25a.25.25,0,1,1-.25.25A.25.25,0,0,1,10,4.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="13.5"
                                      y1="8"
                                      x2="23.5"
                                      y2="8"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5px"
                                      strokeMiterlimit="10"
                                    ></line>
                                    <line
                                      x1="13.5"
                                      y1="4"
                                      x2="23.5"
                                      y2="4"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5px"
                                      strokeMiterlimit="10"
                                    ></line>
                                    <line
                                      x1="21.5"
                                      y1="2"
                                      x2="21.5"
                                      y2="12"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5px"
                                      strokeMiterlimit="10"
                                    ></line>
                                    <line
                                      x1="17.5"
                                      y1="2"
                                      x2="17.5"
                                      y2="12"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5px"
                                      strokeMiterlimit="10"
                                    ></line>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">
                                  We Are building our first product
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
                            <div className="option-counter">3</div>
                            <input
                              // onClick="heyflow.navigation.navigate('go','screen-d8ffb788');"
                              onChange={(e) => {
                                handleOnChange(
                                  e,
                                  1,
                                  "We generate our first revenue",
                                );
                              }}
                              type="radio"
                              id="mco-db4672ad"
                              data-type="multiple-choice"
                              data-label="Startup Stage"
                              name="mc-7104fe52"
                              data-variable=""
                              value={payload[0].selected}
                              data-conditional="true"
                              data-answer="We generate our first revenue"
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
                                    <title>cash-bulb</title>
                                    <line
                                      x1="9"
                                      y1="21.75"
                                      x2="15"
                                      y2="21.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <line
                                      x1="12"
                                      y1="21.75"
                                      x2="12"
                                      y2="23.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <path
                                      d="M20.25,9A8.25,8.25,0,1,0,9,16.687V18.75h6V16.687A8.252,8.252,0,0,0,20.25,9Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M10.142,10.844A2.221,2.221,0,0,0,12,11.719c1.139,0,2.062-.693,2.062-1.547S13.139,8.625,12,8.625,9.937,7.932,9.937,7.077,10.861,5.53,12,5.53a2.224,2.224,0,0,1,1.858.875"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <line
                                      x1="12"
                                      y1="11.719"
                                      x2="12"
                                      y2="12.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <line
                                      x1="12"
                                      y1="4.5"
                                      x2="12"
                                      y2="5.53"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">
                                  We generate our first revenue
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
                                  "We generate enough revenue",
                                );
                              }}
                              type="radio"
                              id="mco-f14bfb5a"
                              data-type="multiple-choice"
                              data-label="Startup Stage"
                              name="mc-7104fe52"
                              data-variable=""
                              value={payload[0].selected}
                              data-conditional="true"
                              data-answer="We generate enough revenue"
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
                                    <title>network-clock</title>
                                    <circle
                                      cx="17.25"
                                      cy="17.25"
                                      r="6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></circle>
                                    <polyline
                                      points="19.902 17.25 17.25 17.25 17.25 14.599"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></polyline>
                                    <path
                                      d="M10.494,23.15A11.251,11.251,0,1,1,23.152,10.506"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M9.289,22.921C7.768,20.689,6.75,16.633,6.75,12S7.768,3.312,9.289,1.079"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
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
                                      strokeWidth="1.5px"
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
                                      strokeWidth="1.5px"
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
                                      strokeWidth="1.5px"
                                    ></line>
                                    <path
                                      d="M14.711,1.079a16.983,16.983,0,0,1,2.3,7.136"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">
                                  We generate enough revenue
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
                            <div className="option-counter">5</div>
                            <input
                              // onClick="heyflow.navigation.navigate('go','screen-d8ffb788');"
                              onChange={(e) => {
                                handleOnChange(
                                  e,
                                  1,
                                  "Wondering whether it’s really possible to take-over the world",
                                );
                              }}
                              type="radio"
                              id="option-7bcbe942"
                              data-type="multiple-choice"
                              data-label="Startup Stage"
                              name="mc-7104fe52"
                              data-variable=""
                              value={payload[0].selected}
                              data-conditional="true"
                              data-answer="Looking for funding to take over the world"
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
                                    <title>space-rocket-2</title>
                                    <path
                                      d="M22.5,11.25V7.062a4.506,4.506,0,0,0-.475-2.012l-.857-1.715a.189.189,0,0,0-.336,0L19.975,5.05A4.506,4.506,0,0,0,19.5,7.062V8.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M1.5,11.25V7.062A4.506,4.506,0,0,1,1.975,5.05l.857-1.715a.189.189,0,0,1,.336,0L4.025,5.05A4.506,4.506,0,0,1,4.5,7.062V8.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M10.494,7.356a2,2,0,0,1,2.994.138"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <line
                                      x1="8.514"
                                      y1="3.75"
                                      x2="15.486"
                                      y2="3.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <line
                                      x1="12"
                                      y1="18"
                                      x2="12"
                                      y2="23.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <path
                                      d="M15.75,23.25H8.25L7.5,7.5C7.5,5.015,9.515.75,12,.75s4.5,4.265,4.5,6.75Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M16.363,10.38l5.113,4.474A3,3,0,0,1,22.5,17.111V20.25a1.5,1.5,0,0,1-1.5,1.5H15.821"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M7.637,10.38,2.524,14.854A3,3,0,0,0,1.5,17.111V20.25A1.5,1.5,0,0,0,3,21.75H8.179"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">
                                  Wondering whether it&apos;s really possible to
                                  take-over the world
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
                  <h2>How are you currently funded?</h2>
                </div>
              </div>
            </div>
            <div className="block" data-blocktype="multiple-choice">
              <div
                className="block-content multiple-choice-block inner-mid"
                data-align-siblings="false"
              >
                <div style={{ paddingTop: 20, paddingBottom: 20 }}>
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
                                handleOnChange(e, 2, "Eeem .. what?");
                              }}
                              id="mco-5c41a271"
                              data-type="multiple-choice"
                              data-label="Funding Search"
                              name="mc-9a2f80dd"
                              data-variable=""
                              value={payload[1].selected}
                              data-conditional="true"
                              data-answer="Eeem .. what? "
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
                                    <title>browser-user-help-message</title>
                                    <path
                                      d="M16.125,4.875A1.875,1.875,0,1,1,18,6.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M18,9a.375.375,0,1,0,.375.375A.375.375,0,0,0,18,9h0"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M21.18,10.178a5.271,5.271,0,1,0-7.117-.738l-.656,3.779,2.532-1.561"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <circle
                                      cx="8.232"
                                      cy="15.375"
                                      r="3.375"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></circle>
                                    <path
                                      d="M13.46,23.243A6.062,6.062,0,0,0,3,23.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <line
                                      x1="18"
                                      y1="14.25"
                                      x2="18"
                                      y2="23.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <path
                                      d="M.75,23.25V3.75a3,3,0,0,1,3-3h7.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <line
                                      x1="0.75"
                                      y1="5.321"
                                      x2="9.75"
                                      y2="5.321"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Eeem .. what?</div>
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
                                handleOnChange(e, 2, "Working on it ...");
                              }}
                              type="radio"
                              id="mco-dcbb33ba"
                              data-type="multiple-choice"
                              data-label="Funding Search"
                              name="mc-9a2f80dd"
                              data-variable=""
                              value={payload[1].selected}
                              data-conditional="true"
                              data-answer="Working on it ..."
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
                                    <title>cash-toggles</title>
                                    <path
                                      d="M7.281,9.363a1.3,1.3,0,0,0,1.938,0l.627-.694a1.306,1.306,0,0,1,2.274.941l-.048.935a1.307,1.307,0,0,0,1.371,1.371l.934-.048a1.306,1.306,0,0,1,.942,2.274l-.694.626a1.306,1.306,0,0,0,0,1.939l.694.627a1.306,1.306,0,0,1-.942,2.274l-.934-.048a1.307,1.307,0,0,0-1.371,1.371l.048.934a1.306,1.306,0,0,1-2.274.942l-.627-.694a1.3,1.3,0,0,0-1.938,0l-.627.694a1.306,1.306,0,0,1-2.274-.942l.048-.934A1.307,1.307,0,0,0,3.057,19.56l-.934.048a1.306,1.306,0,0,1-.942-2.274l.694-.627a1.306,1.306,0,0,0,0-1.939l-.694-.626a1.306,1.306,0,0,1,.942-2.274l.934.048a1.307,1.307,0,0,0,1.371-1.371L4.38,9.61a1.306,1.306,0,0,1,2.274-.941Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M18.638,4.987a.375.375,0,1,0,.375.375.374.374,0,0,0-.375-.375h0"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M21.194,1.835a.75.75,0,0,1,.97.971l-.5,1.286a.752.752,0,0,0,.229.856l1.076.865a.75.75,0,0,1-.355,1.325l-1.364.211a.75.75,0,0,0-.626.627l-.211,1.363a.75.75,0,0,1-1.326.355l-.864-1.075a.751.751,0,0,0-.856-.229l-1.287.5a.75.75,0,0,1-.97-.971l.5-1.286a.752.752,0,0,0-.229-.856l-1.076-.864a.751.751,0,0,1,.355-1.326l1.364-.211a.748.748,0,0,0,.626-.626l.211-1.364a.75.75,0,0,1,1.326-.355l.865,1.075a.749.749,0,0,0,.855.23Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M9.443,13.56H7.693A.955.955,0,0,0,6.8,14.566a1.01,1.01,0,0,0,.562.934l1.77.619a1.014,1.014,0,0,1,.562.935A.955.955,0,0,1,8.8,18.06H6.693"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <line
                                      x1="8.193"
                                      y1="13.56"
                                      x2="8.193"
                                      y2="12.56"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <line
                                      x1="8.193"
                                      y1="19.06"
                                      x2="8.193"
                                      y2="18.06"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Working on it ...</div>
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
                                handleOnChange(
                                  e,
                                  2,
                                  "First investors onbarded",
                                );
                              }}
                              type="radio"
                              id="mco-51872d1a"
                              data-type="multiple-choice"
                              data-label="Funding Search"
                              name="mc-9a2f80dd"
                              data-variable=""
                              value={payload[1].selected}
                              data-conditional="true"
                              data-answer="First investors onbarded"
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
                                    <title>cash-user-woman-message</title>
                                    <path
                                      d="M14.25,15.75v4.5l4.5-4.5h3a1.5,1.5,0,0,0,1.5-1.5v-12a1.5,1.5,0,0,0-1.5-1.5h-12a1.5,1.5,0,0,0-1.5,1.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M18.375,5.091H15.75a1.342,1.342,0,0,0-.5,2.588l2.655.825a1.342,1.342,0,0,1-.5,2.587H14.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <line
                                      x1="16.5"
                                      y1="5.091"
                                      x2="16.5"
                                      y2="3.591"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <line
                                      x1="16.5"
                                      y1="12.591"
                                      x2="16.5"
                                      y2="11.091"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <circle
                                      cx="6"
                                      cy="7.5"
                                      r="3"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></circle>
                                    <path
                                      d="M3,7.5S3,11.25.75,11.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M9,7.5s0,3.75,2.25,3.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M8.625,23.25,9,19.5h2.25V17.25a5.246,5.246,0,0,0-2.364-4.386L6,17.25,3.114,12.864A5.246,5.246,0,0,0,.75,17.25V19.5H3l.375,3.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">
                                  First investors onbarded
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
                                handleOnChange(e, 2, "Counting the money");
                              }}
                              type="radio"
                              id="mco-23de6177"
                              data-type="multiple-choice"
                              data-label="Funding Search"
                              name="mc-9a2f80dd"
                              data-variable=""
                              value={payload[1].selected}
                              data-conditional="true"
                              data-answer="Counting the money"
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
                                    <title>cash-briefcase</title>
                                    <path
                                      d="M9.75,15.937c0,.932,1.007,1.688,2.25,1.688s2.25-.756,2.25-1.688S13.243,14.25,12,14.25s-2.25-.756-2.25-1.688,1.007-1.687,2.25-1.687,2.25.755,2.25,1.687"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <line
                                      x1="12"
                                      y1="9.75"
                                      x2="12"
                                      y2="10.875"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <line
                                      x1="12"
                                      y1="17.625"
                                      x2="12"
                                      y2="18.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <rect
                                      x="1.5"
                                      y="6.75"
                                      width="21"
                                      height="15"
                                      rx="1.5"
                                      ry="1.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></rect>
                                    <path
                                      d="M15.342,3.275A1.5,1.5,0,0,0,13.919,2.25H10.081A1.5,1.5,0,0,0,8.658,3.275L7.5,6.75h9Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Counting the money</div>
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
                                handleOnChange(e, 2, "Bootstrapped");
                              }}
                              type="radio"
                              id="option-be68ddbd"
                              data-type="multiple-choice"
                              data-label="Funding Search"
                              name="mc-9a2f80dd"
                              data-variable=""
                              value={payload[1].selected}
                              data-conditional="true"
                              data-answer="Bootstrapped "
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
                                    <title>footwear-boots-cowboy</title>
                                    <path
                                      d="M15,14.25c-7.143,0-2.663-7.373-1.5-11.25,0,0-1.5-2.25-6-2.25S1.5,3,1.5,3V21.75A1.5,1.5,0,0,0,3,23.25H6v-4.5a3,3,0,0,1,3,3v1.5H21a1.5,1.5,0,0,0,1.5-1.5A7.5,7.5,0,0,0,15,14.25Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <line
                                      x1="1.5"
                                      y1="20.25"
                                      x2="6"
                                      y2="20.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <line
                                      x1="8.596"
                                      y1="20.25"
                                      x2="22.35"
                                      y2="20.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Bootstrapped</div>
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
                  <h2>How Are You Looking for Investors?</h2>
                </div>
              </div>
            </div>
            <div className="block" data-blocktype="multiple-choice">
              <div
                className="block-content multiple-choice-block inner-mid"
                data-align-siblings="false"
              >
                <div style={{ paddingTop: 20, paddingBottom: 20 }}>
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
                                  3,
                                  "How to look for investors",
                                );
                              }}
                              type="radio"
                              id="mco-f3926ff4"
                              data-type="multiple-choice"
                              data-label="Ways to look for investors"
                              name="mc-f5c6f017"
                              data-variable=""
                              value={payload[2].selected}
                              data-conditional="true"
                              data-answer="How to look for investors"
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
                                    <title>user-question</title>
                                    <path
                                      d="M15.5,23.25V19.511l1.007.168A3,3,0,0,0,20,16.719V14.261l.935-.234a1.5,1.5,0,0,0,.884-2.287L20,9.011v-.75C20,3.835,15.521.3,10.182.8A8.994,8.994,0,0,0,6.5,17.547v5.7"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M8.572,8.25a3,3,0,1,1,4,2.829,1.5,1.5,0,0,0-1,1.415v.256"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M11.572,15.75a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375h0"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">
                                  Puh ... um... no idea
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
                                handleOnChange(e, 3, "Web search");
                              }}
                              type="radio"
                              id="mco-7a9a5701"
                              data-type="multiple-choice"
                              data-label="Ways to look for investors"
                              name="mc-f5c6f017"
                              data-variable=""
                              value={payload[2].selected}
                              data-conditional="true"
                              data-answer="Web search"
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
                                    <title>network-arrow</title>
                                    <path
                                      d="M13.588,23.141A11.565,11.565,0,0,1,12,23.25a11.257,11.257,0,1,1,11.137-9.658"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M9.289,22.921C7.767,20.689,6.749,16.633,6.749,12S7.767,3.312,9.289,1.079"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <line
                                      x1="0.774"
                                      y1="11.25"
                                      x2="11.249"
                                      y2="11.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <line
                                      x1="16.499"
                                      y1="11.25"
                                      x2="23.225"
                                      y2="11.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
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
                                      strokeWidth="1.5px"
                                    ></line>
                                    <line
                                      x1="2.047"
                                      y1="17.25"
                                      x2="10.499"
                                      y2="17.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <path
                                      d="M14.71,1.079c1.348,1.978,2.3,5.386,2.5,9.359q.021.408.031.813"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M13.013,13.846l2.158,7.191a.667.667,0,0,0,1.112.281l1.1-1.1,2.835,2.836a.67.67,0,0,0,.945,0l1.891-1.891a.668.668,0,0,0,0-.945l-2.836-2.836,1.1-1.1a.668.668,0,0,0-.28-1.112l-7.192-2.158A.668.668,0,0,0,13.013,13.846Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Web search</div>
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
                                handleOnChange(e, 3, "Events");
                              }}
                              type="radio"
                              id="option-4dfe0e6e"
                              data-type="multiple-choice"
                              data-label="Ways to look for investors"
                              name="mc-f5c6f017"
                              data-variable=""
                              value={payload[2].selected}
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
                                    <title>team-chat</title>
                                    <path
                                      d="M12.749,21h1.5v2.25l3-2.25h4.5a1.5,1.5,0,0,0,1.5-1.5V15a1.5,1.5,0,0,0-1.5-1.5h-9a1.5,1.5,0,0,0-1.5,1.5v4.5A1.5,1.5,0,0,0,12.749,21Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <circle
                                      cx="4.973"
                                      cy="16.875"
                                      r="2.625"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></circle>
                                    <path
                                      d="M9.2,23.25a4.474,4.474,0,0,0-8.449,0"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <circle
                                      cx="19.024"
                                      cy="4.125"
                                      r="2.625"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></circle>
                                    <path
                                      d="M23.249,10.5a4.474,4.474,0,0,0-8.449,0"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <line
                                      x1="16.499"
                                      y1="15.75"
                                      x2="20.249"
                                      y2="15.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <line
                                      x1="14.249"
                                      y1="18"
                                      x2="20.249"
                                      y2="18"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <path
                                      d="M11.249,8.25h-1.5V10.5l-3-2.25h-4.5a1.5,1.5,0,0,1-1.5-1.5V2.25a1.5,1.5,0,0,1,1.5-1.5h9a1.5,1.5,0,0,1,1.5,1.5v4.5A1.5,1.5,0,0,1,11.249,8.25Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <line
                                      x1="7.499"
                                      y1="3"
                                      x2="3.749"
                                      y2="3"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <line
                                      x1="9.749"
                                      y1="5.25"
                                      x2="3.749"
                                      y2="5.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">Events</div>
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
                                handleOnChange(e, 3, "My network");
                              }}
                              type="radio"
                              id="mco-a135488a"
                              data-type="multiple-choice"
                              data-label="Ways to look for investors"
                              name="mc-f5c6f017"
                              data-variable=""
                              value={payload[2].selected}
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
                                    <title>monitor-team</title>
                                    <path
                                      d="M21,10.5v8.25a1.5,1.5,0,0,1-1.5,1.5H4.5A1.5,1.5,0,0,1,3,18.75V10.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <line
                                      x1="12"
                                      y1="20.25"
                                      x2="12"
                                      y2="23.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <line
                                      x1="6.75"
                                      y1="23.25"
                                      x2="17.25"
                                      y2="23.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <circle
                                      cx="4.647"
                                      cy="3"
                                      r="2.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></circle>
                                    <path
                                      d="M8.543,8.25a4.5,4.5,0,0,0-7.793,0"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <circle
                                      cx="19.354"
                                      cy="3"
                                      r="2.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></circle>
                                    <path
                                      d="M23.25,8.25a4.5,4.5,0,0,0-7.793,0"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <circle
                                      cx="12"
                                      cy="3"
                                      r="2.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></circle>
                                    <path
                                      d="M15.676,7.906a4.5,4.5,0,0,0-7.353,0"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <line
                                      x1="21"
                                      y1="17.25"
                                      x2="3"
                                      y2="17.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">My network</div>
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
                                handleOnChange(e, 3, "We try other services");
                              }}
                              type="radio"
                              id="mco-26eba467"
                              data-type="multiple-choice"
                              data-label="Ways to look for investors"
                              name="mc-f5c6f017"
                              data-variable=""
                              value={payload[2].selected}
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
                                    <title>monitor-page</title>
                                    <path
                                      d="M21.5,5.5h1a1,1,0,0,1,1,1v13a1,1,0,0,1-1,1H1.5a1,1,0,0,1-1-1V6.5a1,1,0,0,1,1-1h1"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <line
                                      x1="7"
                                      y1="23.5"
                                      x2="17"
                                      y2="23.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5px"
                                      strokeMiterlimit="10"
                                    ></line>
                                    <line
                                      x1="10.5"
                                      y1="20.5"
                                      x2="10.5"
                                      y2="23.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5px"
                                      strokeMiterlimit="10"
                                    ></line>
                                    <line
                                      x1="13.5"
                                      y1="20.5"
                                      x2="13.5"
                                      y2="23.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5px"
                                      strokeMiterlimit="10"
                                    ></line>
                                    <path
                                      d="M4.5,15.5V1.5a1,1,0,0,1,1-1h13a1,1,0,0,1,1,1v14"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <rect
                                      x="6.5"
                                      y="7.501"
                                      width="4"
                                      height="4"
                                      rx="0.5"
                                      ry="0.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5px"
                                      strokeMiterlimit="10"
                                    ></rect>
                                    <line
                                      x1="12.601"
                                      y1="10.501"
                                      x2="17.5"
                                      y2="10.501"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5px"
                                      strokeMiterlimit="10"
                                    ></line>
                                    <line
                                      x1="12.601"
                                      y1="8.001"
                                      x2="17.5"
                                      y2="8.001"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5px"
                                      strokeMiterlimit="10"
                                    ></line>
                                    <line
                                      x1="6.5"
                                      y1="13.5"
                                      x2="17.5"
                                      y2="13.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5px"
                                      strokeMiterlimit="10"
                                    ></line>
                                    <line
                                      x1="0.5"
                                      y1="17.5"
                                      x2="23.5"
                                      y2="17.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5px"
                                      strokeMiterlimit="10"
                                    ></line>
                                    <line
                                      x1="4.5"
                                      y1="4.5"
                                      x2="19.5"
                                      y2="4.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5px"
                                      strokeMiterlimit="10"
                                    ></line>
                                    <path
                                      d="M6.75,2.5a.25.25,0,1,1-.25.25.25.25,0,0,1,.25-.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M8.75,2.5a.25.25,0,1,1-.25.25.25.25,0,0,1,.25-.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M10.75,2.5a.25.25,0,1,1-.25.25.25.25,0,0,1,.25-.25"
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
                                  We try other services
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
                            <div className="option-counter">6</div>
                            <input
                              // onClick="heyflow.navigation.navigate('next','');"
                              onChange={(e) => {
                                handleOnChange(
                                  e,
                                  3,
                                  "We don't need investors right now ...",
                                );
                              }}
                              type="radio"
                              id="option-2e514189"
                              data-type="multiple-choice"
                              data-label="Ways to look for investors"
                              name="mc-f5c6f017"
                              data-variable=""
                              value={payload[2].selected}
                              data-conditional="true"
                              data-answer="We don't need investors right now ..."
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
                                    <title>user-cash-scale</title>
                                    <path
                                      d="M18.75,6.75H16.717a1.342,1.342,0,0,0-.5,2.587l2.064.825a1.342,1.342,0,0,1-.5,2.588H15.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <line
                                      x1="17.25"
                                      y1="6.75"
                                      x2="17.25"
                                      y2="6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <line
                                      x1="17.25"
                                      y1="13.5"
                                      x2="17.25"
                                      y2="12.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <circle
                                      cx="17.25"
                                      cy="9.75"
                                      r="6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></circle>
                                    <circle
                                      cx="4.5"
                                      cy="3.375"
                                      r="2.625"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></circle>
                                    <path
                                      d="M6.375,15.75l.375-3h1.5V10.5a3.75,3.75,0,0,0-7.5,0v2.25h1.5l.375,3"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <line
                                      x1="0.75"
                                      y1="18.75"
                                      x2="23.25"
                                      y2="18.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <polygon
                                      points="15 23.25 9 23.25 12 19.5 15 23.25"
                                      style={{
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        strokeWidth: "1.5px",
                                      }}
                                    ></polygon>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">
                                  We don't need investors right now ...
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
                  <h2>How Much Experience Do You Have As an Entrepreneur?</h2>
                </div>
              </div>
            </div>
            <div className="block" data-blocktype="multiple-choice">
              <div
                className="block-content multiple-choice-block inner-mid"
                data-align-siblings="false"
              >
                <div style={{ paddingTop: 20, paddingBottom: 20 }}>
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
                                handleOnChange(e, 4, "Just figuring it out");
                              }}
                              type="radio"
                              id="mco-7cc37a4c"
                              data-type="multiple-choice"
                              data-label="Entrepreneur Experience"
                              name="mc-7f337c89"
                              data-variable=""
                              value={payload[3].selected}
                              data-conditional="true"
                              data-answer="Just figuring it out"
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
                                    <title>question-circle</title>
                                    <path
                                      d="M9,9a3,3,0,1,1,4,2.829,1.5,1.5,0,0,0-1,1.415V14.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5px"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M12,17.25a.375.375,0,1,0,.375.375A.375.375,0,0,0,12,17.25h0"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5px"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <circle
                                      cx="12"
                                      cy="12"
                                      r="11.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5px"
                                      strokeMiterlimit="10"
                                    ></circle>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">
                                  Just figuring it out
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
                                handleOnChange(e, 4, "1-2 years");
                              }}
                              type="radio"
                              id="mco-7cce07dd"
                              data-type="multiple-choice"
                              data-label="Entrepreneur Experience"
                              name="mc-7f337c89"
                              data-variable=""
                              value={payload[3].selected}
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
                                      strokeWidth="1.5px"
                                      strokeMiterlimit="10"
                                    ></line>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">1-2 years</div>
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
                                handleOnChange(e, 4, "3-5 years");
                              }}
                              type="radio"
                              id="mco-64131512"
                              data-type="multiple-choice"
                              data-label="Entrepreneur Experience"
                              name="mc-7f337c89"
                              data-variable=""
                              value={payload[3].selected}
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
                                <div className="label">3-5 years</div>
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
                                handleOnChange(
                                  e,
                                  4,
                                  "call me entrepreneur grandparent",
                                );
                              }}
                              type="radio"
                              id="mco-af36a88d"
                              data-type="multiple-choice"
                              data-label="Entrepreneur Experience"
                              name="mc-7f337c89"
                              data-variable=""
                              value={payload[3].selected}
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
                                    <title>business-climb-top-1</title>
                                    <path
                                      d="M4.25,23.5,12.75,10a1.259,1.259,0,0,1,2,0l8.5,13.5Z"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="0.985px"
                                    ></path>
                                    <path
                                      d="M4.25,23.5H.75L4.25,18a1.341,1.341,0,0,1,1-.5,1.341,1.341,0,0,1,1,.5L6.9,19.3"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="0.985px"
                                    ></path>
                                    <path
                                      d="M8.705,16.424l2.343,1.982a1,1,0,0,0,1.353-.057l.642-.642a1,1,0,0,1,1.414,0l.642.642a1,1,0,0,0,1.353.057L18.8,16.424"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="0.985px"
                                    ></path>
                                    <line
                                      x1="13.75"
                                      y1="9.5"
                                      x2="13.75"
                                      y2="0.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="0.985px"
                                    ></line>
                                    <path
                                      d="M13.75.5h5.5a.5.5,0,0,1,.5.5V5a.5.5,0,0,1-.5.5h-5.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="0.985px"
                                    ></path>
                                    <path
                                      d="M19.75,2.5h2.5a.5.5,0,0,1,.5.5V7a.5.5,0,0,1-.5.5h-3a.5.5,0,0,1-.5-.5V5.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="0.985px"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">
                                  call me entrepreneur grandparent
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
                  <h2>
                    How Much Time Do You Think You Need For Your Next Funding?
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
                                handleOnChange(e, 5, "No idea");
                              }}
                              type="radio"
                              id="mco-4e2d05e0"
                              data-type="multiple-choice"
                              data-label="Time Frame"
                              name="mc-2bcbcff1"
                              data-variable=""
                              value={payload[4].selected}
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
                                    <title>question-circle</title>
                                    <path
                                      d="M9,9a3,3,0,1,1,4,2.829,1.5,1.5,0,0,0-1,1.415V14.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5px"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <path
                                      d="M12,17.25a.375.375,0,1,0,.375.375A.375.375,0,0,0,12,17.25h0"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5px"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></path>
                                    <circle
                                      cx="12"
                                      cy="12"
                                      r="11.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5px"
                                      strokeMiterlimit="10"
                                    ></circle>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">No idea</div>
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
                                handleOnChange(e, 5, "6-12 months");
                              }}
                              type="radio"
                              id="mco-69f2a128"
                              data-type="multiple-choice"
                              data-label="Time Frame"
                              name="mc-2bcbcff1"
                              data-variable=""
                              value={payload[4].selected}
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
                                    <title>stopwatch</title>
                                    <circle
                                      cx="12"
                                      cy="14.25"
                                      r="9"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></circle>
                                    <line
                                      x1="18"
                                      y1="7.5"
                                      x2="19.875"
                                      y2="5.625"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <line
                                      x1="19.5"
                                      y1="5.25"
                                      x2="20.25"
                                      y2="6"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <line
                                      x1="12"
                                      y1="5.25"
                                      x2="12"
                                      y2="0.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <line
                                      x1="14.25"
                                      y1="0.75"
                                      x2="9.75"
                                      y2="0.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <line
                                      x1="12"
                                      y1="15"
                                      x2="8.25"
                                      y2="10.849"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">6-12 months</div>
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
                                handleOnChange(e, 5, "More than 1 year");
                              }}
                              type="radio"
                              id="mco-f3d54741"
                              data-type="multiple-choice"
                              data-label="Time Frame"
                              name="mc-2bcbcff1"
                              data-variable=""
                              value={payload[4].selected}
                              data-conditional="true"
                              data-answer="More than 1 year"
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
                                    <title>time-clock-hand-1</title>
                                    <line
                                      x1="0.75"
                                      y1="14.25"
                                      x2="0.75"
                                      y2="23.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <path
                                      d="M.75,21.75h15a3,3,0,0,0-3-3H9a3,3,0,0,0-3-3H.75"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
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
                                      strokeWidth="1.5px"
                                    ></line>
                                    <path
                                      d="M7.684,12.816A8.25,8.25,0,1,1,17.021,17"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <polyline
                                      points="14.25 3.75 14.25 9.75 18 9.75"
                                      style={{
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        strokeWidth: "1.5px",
                                      }}
                                    ></polyline>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">More than 1 year</div>
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
                                handleOnChange(
                                  e,
                                  5,
                                  "Currently we don't need addtional funding",
                                );
                              }}
                              type="radio"
                              id="mco-4e92bea2"
                              data-type="multiple-choice"
                              data-label="Time Frame"
                              name="mc-2bcbcff1"
                              data-variable=""
                              value={payload[4].selected}
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
                                    <title>beach-palm-sunbed</title>
                                    <path
                                      d="M8.25,7.5,14.6,11.387a.729.729,0,0,0,1.109-.6,4.1,4.1,0,0,0-2.189-4.083,5.953,5.953,0,0,0-2.02-.592"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M8.25,7.5H1.5A.769.769,0,0,1,.816,6.467a4.165,4.165,0,0,1,3.957-2.68A5.549,5.549,0,0,1,7.4,4.531"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M12.864,6.429l3.309-1.97a.653.653,0,0,0,.085-1.073,4.264,4.264,0,0,0-4.428-.673A3.243,3.243,0,0,0,10.3,4.139"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M5.907,3.939,4.712,1.72a.656.656,0,0,1,.6-.969A11.571,11.571,0,0,1,7.5,1.094a4.454,4.454,0,0,1,2.808,3.045"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M23.25,20.25H14.383a1.5,1.5,0,0,1-1.312-.772L10.5,14.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <line
                                      x1="20.252"
                                      y1="20.25"
                                      x2="21.002"
                                      y2="23.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <line
                                      x1="13.61"
                                      y1="20.034"
                                      x2="12.002"
                                      y2="23.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <line
                                      x1="11.607"
                                      y1="16.5"
                                      x2="16.5"
                                      y2="16.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></line>
                                    <path
                                      d="M.75,23.25C.867,21.258.84,12.828,7.5,7.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                    <path
                                      d="M8.25,7.5A31.7,31.7,0,0,0,6,23.25"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5px"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="label-container">
                                <div className="label">
                                  Currently we don't need addtional funding
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
                      style={{ color: "#fff", marginTop: 20, marginBottom: 20 }}
                    >
                      Verify Your Identity
                    </h2>
                    <h3 style={{ color: "#ccc" }}>
                      Enter the six digits sent to your phone number to verify
                      your identity.
                    </h3>

                    {/*<span className="text-[#ec3b37]"> {otpState ? userInfo.phone : ''}</span>*/}
                  </div>
                ) : (
                  <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                    <h2 style={{ color: "#fff" }}>
                      Get Matched With Investors Ready to Fund
                    </h2>
                    <h3 style={{ color: "#ccc", marginTop: "1rem" }}>
                      You're closer than you think.
                    </h3>
                    <p
                      style={{
                        color: "#999",
                        maxWidth: "600px",
                        margin: "1rem auto",
                      }}
                    >
                      Join Mk Timothy and get connected to investors actively
                      looking for promising ventures like yours.
                    </p>
                    <div
                      style={{
                        height: "1px",
                        background:
                          "linear-gradient(90deg, transparent, #333, transparent)",
                        margin: "2rem auto",
                        maxWidth: "400px",
                      }}
                    ></div>
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
                        <PhoneInput
                          country={"us"}
                          value={userInfo.phone}
                          inputStyle={{ paddingLeft: "46px" }}
                          name="phone"
                          // onChange={(e) => {
                          //     // handleSignupFormChange(e)
                          // }}
                          onChange={(phone) =>
                            setUserInfo({ ...userInfo, phone: phone })
                          }
                        />
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
                                data-label="User agreement"
                                data-answer="✔"
                                value="✔"
                                checked={agreeToTerms}
                                onChange={() => setAgreeToTerms(!agreeToTerms)}
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
                                <div className="label-container">
                                  <span
                                    style={{ color: "#fff" }}
                                    className="simple-checkbox-text"
                                  >
                                    I agree to the{" "}
                                    <a
                                      target="_blank"
                                      href="/legal-disclaimer"
                                      style={{ color: "#00A372" }}
                                    >
                                      terms
                                    </a>{" "}
                                    and confirm I want to be matched with
                                    investors.
                                  </span>
                                </div>
                              </div>
                            </label>
                            {formErrors.agreeToTerms && (
                              <div
                                style={{
                                  color: "red",
                                  fontSize: "12px",
                                  marginTop: "5px",
                                }}
                              >
                                Please agree to the terms to continue
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="block" data-blocktype="generic-button">
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
                                          : "Get Matched Now"}
                                      </font>
                                    </font>
                                  </span>
                                </div>
                              </div>
                            </button>
                            <p
                              style={{
                                color: "#999",
                                textAlign: "center",
                                marginTop: "1.5rem",
                                fontSize: "0.9rem",
                              }}
                            >
                              Serious founders. Real investors. Real capital.
                            </p>
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

        {page == 6 && (
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
                  <h2>
                    Congratulations. Your registration details have been
                    received successfully.
                  </h2>
                  <h2>
                    <br />
                  </h2>
                </div>
              </div>
            </div>

            <div className="block" data-blocktype="generic-button">
              <div className="block-content generic-button-block inner-narrow">
                <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                  <button
                    id="button-c47f9853"
                    className="generic-button link align-center large"
                    onClick={() => {
                      window.location.href = "https://mktimothy.com/";
                    }}
                  >
                    <div className="content align-space-between">
                      <div className="label-container">
                        <span style={{ color: "#00A372" }} className="label">
                          Click here to learn more about Mk Timothy.
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
                  <p>
                    Please check your email, and click on the link provided to
                    complete the registration process.Remember to review all the
                    folders, including{" "}
                    <span className="color-orange">Spam</span>, and marking it
                    not <span className="color-orange">Spam</span>.
                  </p>
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
                      window.location.href =
                        "https://twitter.com/mktimothy";
                    }}
                  >
                    <div className="content align-space-between reverse">
                      <div className="label-container">
                        <span style={{ color: "#00A372" }} className="label">
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
            <div className="mx-auto w-fit" data-blocktype="generic-button">
              <div className="block-content generic-button-block inner-narrow">
                <div style={{ paddingTop: 2, paddingBottom: 2 }}>
                  <button
                    id="id-1d668be0"
                    className="generic-button link large align-center"
                    onClick={() => {
                      window.location.href =
                        "https://twitter.com/mktimothy";
                    }}
                  >
                    <div className="content align-space-between reverse">
                      <div className="label-container">
                        <span style={{ color: "#00A372" }} className="label">
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
            <div className="mx-auto w-fit" data-blocktype="generic-button">
              <div className="block-content generic-button-block inner-narrow">
                <div style={{ paddingTop: 2, paddingBottom: 2 }}>
                  <button
                    id="id-d446848e"
                    className="generic-button link  large align-center"
                    onClick={() => {
                      window.location.href =
                        "https://twitter.com/mktimothy";
                    }}
                  >
                    <div className="content align-space-between reverse">
                      <div className="label-container">
                        <span style={{ color: "#00A372" }} className="label">
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
                        <span style={{ color: "#00A372" }} className="label">
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

        {/* {page == 8 && (

          <div id="error" name="error" data-type="system">
            <div className="block" data-blocktype="headline">
              <div className="headline inner-mid">
                <h2>Error</h2>
                <h4>
                  Sorry, your response could not be sent. Please check your
                  internet connection.
                </h4>
              </div>
            </div>
          </div>)} */}

        {/* {page < 6 && (<div className="block" data-blocktype="generic-button" style={{ margin: "auto", maxWidth: "400px" }}>
          <div className="block-content generic-button-block inner-narrow">
            <div style={{ paddingTop: 20, paddingBottom: 20 }}>
              <button
                onClick={() => {
                  if (page > 0) {
                    setPage(page - 1)
                  }
                }}
                id="id-dcb72009"
                className="generic-button continue medium"
              >
                <div className="indicators">
                  <div className="loading">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      x="0px"
                      y="0px"
                      width="40px"
                      height="40px"
                      viewBox="0 0 40 40"
                      enableBackground="new 0 0 40 40"
                      xmlSpace="preserve"
                    >
                      <path
                        opacity="0.3"
                        fill="currentColor"
                        d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946 s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634 c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"
                      ></path>
                      <path
                        fill="currentColor"
                        d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0 C22.32,8.481,24.301,9.057,26.013,10.047z"
                      >
                        <animateTransform
                          attributeType="xml"
                          attributeName="transform"
                          type="rotate"
                          from="0 20 20"
                          to="360 20 20"
                          dur="0.5s"
                          repeatCount="indefinite"
                        ></animateTransform>
                      </path>
                    </svg>
                  </div>
                  <div className="success">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="192"
                      height="192"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <rect width="256" height="256" fill="none"></rect>
                      <polyline
                        points="216 72.005 104 184 48 128.005"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="24"
                      ></polyline>
                    </svg>
                  </div>
                  <div className="error">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="192"
                      height="192"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <rect width="256" height="256" fill="none"></rect>
                      <line
                        x1="200"
                        y1="56"
                        x2="56"
                        y2="200"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="24"
                      ></line>
                      <line
                        x1="200"
                        y1="200"
                        x2="56"
                        y2="56"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="24"
                      ></line>
                    </svg>
                  </div>
                </div> */}
        {/* ///////////////////////////////////////////////// */}

        {/* <div className="content align-center">
                  <div className="label-container">
                    <span className="label">Back</span>
                  </div>

                </div>
              </button>
            </div>
          </div>
        </div>)} */}
      </div>
    </Layout>
  );
};

export default Form;
