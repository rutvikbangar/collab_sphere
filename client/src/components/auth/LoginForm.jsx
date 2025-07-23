import { useState } from "react";
import { Mail, Shield, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { sendOtp, verifyOtp } from "../../api-service/api.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [step, setStep] = useState('email'); // 'email' or 'otp'

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!email || email === '') {
            toast.error("Enter a valid email");
            setIsLoading(false);
            return;
        }

        const sent = await sendOtp(email);
        setOtpSent(sent);
        setStep('otp');
        setIsLoading(false);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const success = await verifyOtp(email, otp, false);
            if (success) {
                localStorage.setItem('user', JSON.stringify(success.user));
                localStorage.setItem('accessToken', success.accessToken);
                navigate("/");
            }
        } catch (error) {
            toast.error("Verification failed");
        }

        setIsLoading(false);
    };

    const handleBackToEmail = () => {
        setStep('email');
        setOtpSent(false);
        setOtp('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-600">
                        {step === 'email'
                            ? 'Enter your email to receive a secure login code'
                            : 'Enter the verification code sent to your email'}
                    </p>
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8">
                        {/* Progress Indicator */}
                        <div className="flex items-center justify-center mb-8">
                            <div className="flex items-center space-x-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${step === 'email' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                                    }`}>
                                    {step === 'email' ? '1' : <CheckCircle className="w-4 h-4" />}
                                </div>
                                <div className={`w-16 h-1 rounded-full transition-all duration-300 ${step === 'otp' ? 'bg-green-500' : 'bg-gray-200'
                                    }`}></div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${step === 'otp' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    2
                                </div>
                            </div>
                        </div>

                        {step === 'email' ? (
                            // Email Form
                            <form onSubmit={handleSendOtp} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="Enter your email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !email}
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Sending Code...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Verification Code</span>
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            // OTP Form
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                {/* Success Message */}
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <div>
                                            <p className="text-sm font-medium text-green-800">Code sent successfully!</p>
                                            <p className="text-sm text-green-600">Check your email: {email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Verification Code</label>
                                    <input
                                        type="text"
                                        placeholder="Enter 6-digit code"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                        className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center text-2xl font-mono tracking-widest text-gray-900"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={!otp || otp.length !== 6 || isLoading}
                                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Verifying...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="w-5 h-5" />
                                            <span>Verify & Login</span>
                                        </>
                                    )}
                                </button>

                                {/* Back to Email and Resend */}
                                <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={handleBackToEmail}
                                        type="button"
                                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        ← Back to email
                                    </button>
                                    <span className="text-gray-300">•</span>
                                    <button
                                        onClick={handleSendOtp}
                                        type="button"
                                        disabled={isLoading}
                                        className="text-sm text-blue-600 hover:text-blue-700 transition-colors disabled:text-gray-400"
                                    >
                                        Resend code
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Footer */}
                {/* Register Link */}
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Don’t have an account?{" "}
                        <span
                            onClick={() => navigate("/register")}
                            className="text-blue-600 font-medium hover:underline cursor-pointer"
                        >
                            Register
                        </span>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default LoginForm;
