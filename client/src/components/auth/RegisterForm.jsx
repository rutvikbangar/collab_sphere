import React, { useState } from "react";
import { UserIcon, MailIcon, HashIcon } from "../../assets/CustomIcon.jsx";
import { sendOtp, verifyOtp } from "../../api-service/api.js";
import toast from "react-hot-toast";

const RegisterForm = () => {
    // State for form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');

    // State to manage the UI flow
    const [otpSent, setOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!email || email === '') {
            toast.error("Enter email");
            setIsLoading(false);
            return;
        }

        const sent = await sendOtp(email);
        setOtpSent(sent);
        setIsLoading(false);
    };

    const handleVerifyOtpAndRegister =async (e) => {
        e.preventDefault();
        setIsLoading(true);
        if(!otp || otp == ''){
            toast.error("Enter otp");
            setIsLoading(false);
            return;
        }

        const data = await verifyOtp(email,otp,true);
        if(!data){
            setOtp('');
            setOtpSent(false);
        }
        setIsLoading(false);

    };

    return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6 items-center justify-center">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">CollabSphere</h1>
                <p className="text-gray-500 mt-2">
                    {otpSent ? "Verify your email" : "Create your account to start collaborating"}
                </p>
            </div>


            {/* Registration Form */}
            <form onSubmit={otpSent ? handleVerifyOtpAndRegister : handleSendOtp} className="space-y-4">
                {/* --- Stage 1: Email and Name --- */}
                {!otpSent && (
                    <>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon />
                            </div>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MailIcon />
                            </div>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>
                    </>
                )}

                {/* --- Stage 2: OTP Verification --- */}
                {otpSent && (
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <HashIcon />
                        </div>
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            maxLength="6"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>
                )}

                {/* --- User Message/Feedback --- */}
                {message && <p className="text-sm text-center text-green-600">{message}</p>}

                {/* --- Submit Button --- */}
                <button
                    type="submit"
                    className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        otpSent ? 'Verify & Create Account' : 'Continue with Email'
                    )}
                </button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <a href="#" className="font-medium text-blue-600 hover:underline">
                    Sign In
                </a>
            </p>
        </div>
    );
};

export default RegisterForm