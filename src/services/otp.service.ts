import Otp from '../models/otp';
import otpGenerator from 'otp-generator';
import { sendEmail } from '../utils/sendEmail.utils'

// Tạo OTP mới
function generateOTP() {
    return otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
}

export const generateAndSendOTP = async (email: string): Promise<string> => {
    try {
        const otp = generateOTP(); // Generate a 6-digit OTP
        console.log('otp: ' + otp)
        const newOTP = new Otp({
            email,
            otp,
            expiredOtp: Date.now() + 2 * 60 * 1000,
        });
        await newOTP.save();
        await sendEmail({
            to: email,
            subject: 'Email verification code',
            message: `<h4>Hi</h4>
            <body>
            <p>Please use the folowing One Time Password (OTP) to access the form: <strong>${otp}</strong>.</p>
            <p>Do not share this OTP with anyone.</P>
            <p>Thank you!</p>
            </body>`,
        });
        return otp;
    } catch (error: any) {
        return error.message
    }
};

export const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    const existingOTP = await Otp.find({ email });
    const lastOtp = existingOTP[existingOTP.length - 1]
    if (await lastOtp.isCorrectOtp(otp))
        return true;
    return false
};